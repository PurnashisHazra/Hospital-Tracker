const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
var request = require('request');
const passport = require('passport');


var verifier = require('email-verify');
var infoCodes = verifier.infoCodes;
// Load DB
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12353688',
    password: 'xrrP6lqtDA',
    database: 'sql12353688'
});

// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');
//Email Validator
//const { check, validationResult } = require('express-validator');// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));


// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));


var e = 0;
var errors = [];

// Register
router.post('/register',(req, res) => {
  const { name, email, password, password2} = req.body;
   errors = [];
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
}
 ////

////
    
    
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 8) {
    errors.push({ msg: 'Password must be at least 8 characters' });
    }
    ///recaptcha
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        errors.push({ msg: 'Please fill reCaptcha' });
    }
    // Put your secret key here.
    var secretKey = "6LeaCfQUAAAAAMUNmDYg1qkMBtPDPBqhjqVfN8Hf";
    // req.connection.remoteAddress will provide IP address of connected user.
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        // Success will be true or false depending upon captcha validation.
        if (body.success !== undefined && !body.success) {
            errors.push({ msg: 'Failed reCaptcha' });
            
        }
        
    });
    ///
    if (email) {
        verifier.verify(email, function (err, info) {
            if (err) {
                //res.redirect('/users/register');
                errors.push({ msg: 'invalid' });
            }

            console.log("Success (T/F): " + typeof info.success + info.success);
            console.log("Info: " + info.info);
            if (info.success == false) {
                e = 1; //res.redirect('/users/register');
                errors.push({ msg: 'invalid email' });
                console.log(errors);
            } else { e = 0; }
        });
    } 
    console.log(errors);
    console.log(e);
    if (errors.length > 0 || e == 1) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
      
    User.findOne({ email: email }).then(user => {
      if (user) {
          errors.push({ msg: 'Email already exists' });

        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});



// Login
router.post('/login', (req, res, next) => {
    ///recaptcha
    let errors = []
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        errors.push({ msg: 'Please fill reCaptcha' });
    }
    // Put your secret key here.
    var secretKey = "6LeaCfQUAAAAAMUNmDYg1qkMBtPDPBqhjqVfN8Hf";
    // req.connection.remoteAddress will provide IP address of connected user.
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        // Success will be true or false depending upon captcha validation.
        if (body.success !== undefined && !body.success) {
            errors.push({ msg: 'Failed reCaptcha' });

        }

    });
    if (errors.length > 0) {
        req.session
        res.redirect('/users/login');
    } else {
        passport.authenticate('login', {
            successRedirect: '/dashboard',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);
    }
});
// Logout

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});


module.exports = router;
