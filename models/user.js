var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  name: {
    type: String
  },
  profileimage: {
    type: String
  }
});

var User = module.exports = mongoose.model('User', UserSchema);

// Create a user
module.exports.createUser = async function(newUser) {
  try {
    const hash = await bcrypt.hash(newUser.password, 10);
    newUser.password = hash;
    await newUser.save();
    return newUser;
  } catch (err) {
    throw err;
  }
};

// Get a user by username
module.exports.getUserByUsername = async function(username) {
  try {
    const user = await User.findOne({ username: username }).exec();
    return user;
  } catch (err) {
    throw err;
  }
};

// Get a user by ID
module.exports.getUserById = async function(id) {
  try {
    const user = await User.findById(id).exec();
    return user;
  } catch (err) {
    throw err;
  }
};

// Compare passwords
module.exports.comparePassword = async function(candidatePassword, hash) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, hash);
    return isMatch;
  } catch (err) {
    throw err;
  }
};
