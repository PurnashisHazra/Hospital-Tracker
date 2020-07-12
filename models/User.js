const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
    required: true
  },
  date: {
    type: Date,
    default: Date.now
    },
    hospital: {
        type: String,
        default: ""
    },
    officer: {
        type: String,
        default: ""
    },
    officer_pass: {
        type: String
    },
    progress: {
        type: Number,
        default: 0
    },
    problem: {
    type: String,
    default: ""
    }
       
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
