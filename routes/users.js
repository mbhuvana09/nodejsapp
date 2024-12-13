var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

router.post('/register', async function(req, res, next) {
  var name = req.body.name,
      email = req.body.email,
      username = req.body.username,
      password = req.body.password,
      password2 = req.body.password2;

  // check for image fields
  if (req.files && req.files.profileimage) {
    console.log('Uploading File...');
    var profileImageName = req.files.profileimage.originalname;
    var profileImageServer = req.files.profileimage.name;
    var profileImageMime = req.files.profileimage.mimetype;
    var profileImagePath = req.files.profileimage.path;
    var profileImageExt = req.files.profileimage.extension;
    var profileImageSize = req.files.profileimage.size;
  } else {
    var profileImageServer = "noimage.png";
  }

  // Validator
  req.checkBody('name', 'Name Field is required').notEmpty();
  req.checkBody('email', 'Email Field is required').notEmpty();
  req.checkBody('email', 'Email not Valid').isEmail();
  req.checkBody('username', 'UserName Field is required').notEmpty();
  req.checkBody('password', 'Password Field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  // errors
  var errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors,
      name: name,
      email: email,
      username: username,
      password: password,
      password2: password2
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileImageServer
    });

    try {
      await User.createUser(newUser);
      req.flash('success', "You are now registered and may log in");
      res.location('/');
      res.redirect('/');
    } catch (err) {
      console.error('Error creating user:', err);
      req.flash('error', 'Something went wrong. Please try again.');
      res.redirect('/users/register');
    }
  }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.getUserByUsername(username);
      if (!user) {
        console.log("Unknown User");
        return done(null, false, { message: "Unknown User" });
      }

      const isMatch = await User.comparePassword(password, user.password);
      if (isMatch) {
        return done(null, user);
      } else {
        console.log("Invalid Password");
        return done(null, false, { message: "Invalid Password" });
      }
    } catch (err) {
      console.error('Error in LocalStrategy:', err);
      return done(err);
    }
  }
));

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid Username or Password' }), function(req, res) {
  console.log('Authentication Successful');
  req.flash('alert-success', 'You are logged in');
  res.redirect('/');
});

router.get('/logout', function(req, res) {
  req.logout();
  req.flash('alert-success', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
