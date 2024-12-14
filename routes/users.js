var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const { body, validationResult } = require('express-validator'); // Import express-validator

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post(
  '/register',
  [
    body('name', 'Name field is required').notEmpty(),
    body('email', 'Email field is required').notEmpty(),
    body('email', 'Invalid email address').isEmail(),
    body('username', 'Username field is required').notEmpty(),
    body('password', 'Password field is required').notEmpty(),
    body('password2', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
  ],
  async function(req, res, next) {
    const errors = validationResult(req);

    const { name, email, username, password, password2 } = req.body;

    // Handle file upload
    let profileImageServer = 'noimage.png';
    if (req.files && req.files.profileimage) {
      console.log('Uploading file...');
      profileImageServer = req.files.profileimage.name;
    }

    if (!errors.isEmpty()) {
      return res.render('register', {
        errors: errors.array(),
        name,
        email,
        username,
        password,
        password2,
      });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      username,
      password,
      profileimage: profileImageServer,
    });

    try {
      const user = await User.createUser(newUser); // Use async/await for creating user
      console.log(user);
      req.flash('success', 'You are now registered and may log in');
      res.location('/');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Registration failed. Please try again.');
      res.redirect('/users/register');
    }
  }
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy(async function(username, password, done) {
    try {
      const user = await User.getUserByUsername(username);
      if (!user) {
        console.log('Unknown User');
        return done(null, false, { message: 'Unknown User' });
      }

      const isMatch = await User.comparePassword(password, user.password);
      if (isMatch) {
        return done(null, user);
      } else {
        console.log('Invalid Password');
        return done(null, false, { message: 'Invalid Password' });
      }
    } catch (err) {
      return done(err);
    }
  })
);

router.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid Username or Password' }),
  function(req, res) {
    console.log('Authentication Successful');
    req.flash('alert-success', 'You are logged in');
    res.redirect('/');
  }
);

router.get('/logout', function(req, res) {
  req.logout();
  req.flash('alert-success', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
