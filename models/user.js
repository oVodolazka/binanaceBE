const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  avatar:{
    type: String,
    required: false
  },
  binanceKeys: {
    apiKey: {
      type: String,
      required: false
    },
    secretKey: {
      type: String,
      required: false
    }
  }
});

module.exports = User = mongoose.model('users', UserSchema);