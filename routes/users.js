var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
router.get('/register', function(req, res) {
    res.render('register');
});

// Login
router.get('/login', function(req, res) {
    res.render('login');
});

// Register User
router.post('/register', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    //  Note that these function because of expressValidator = require('express-validator') in the users.js file.
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    console.log(errors);
    // This is what errors looks like when no data is entered:
    //    [ { param: 'name', msg: 'Name is required', value: '' },
    // { param: 'email', msg: 'Email is required', value: '' },
    // { param: 'email', msg: 'Email is not valid', value: '' },
    // { param: 'username', msg: 'Username is required', value: '' },
    // { param: 'password', msg: 'Password is required', value: '' } ]
    if (errors) {
        res.render('register', {errors: errors});
    } else {
        var newUser = new User({name: name, email: email, username: username, password: password});

        User.createUser(newUser, function(err, user) {
            if (err)
                throw err;
          // Log the user object below to view what it contains.
          // console.log(user);
        });
        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy(
     function(username, password, done) {
          User.getUserByUsername(username, function(error, user){
               if(error) throw error;
               if(!user){
                    return done(null, false, {message: 'Unknown User'});
               }

               User.comparePassword(password, user.password, function(err, isMatch){
                    if(err) throw err;
                    if(isMatch) {
                         return done(null, user);
                    } else {
                         return done(null, false, {message: 'Invalid password'});
                    }
               });
          });
     }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

//  Note the 'local' is the strategy used, but we could use many strategies, such as linkedin, of which I've included an example below for you to compare with this one.
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
}), function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/');
});

// GET /auth/linkedin
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in LinkedIn authentication will involve
//   redirecting the user to linkedin.com.  After authorization, LinkedIn will
//   redirect the user back to this application at /auth/linkedin/callback
// app.get('/auth/linkedin',
//   passport.authenticate('linkedin'),
//   function(req, res){
//     // The request will be redirected to LinkedIn for authentication, so this
//     // function will not be called.
//   });
//
// // GET /auth/linkedin/callback
// //   Use passport.authenticate() as route middleware to authenticate the
// //   request.  If authentication fails, the user will be redirected back to the
// //   login page.  Otherwise, the primary route function function will be called,
// //   which, in this example, will redirect the user to the home page.
// app.get('/auth/linkedin/callback',
//   passport.authenticate('linkedin', { failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect('/');
//   });

router.get('/logout', function(req, res) {
     req.logout();
     req.flash('success_msg', 'You are logged out');
     res.redirect('/users/login');
});

module.exports = router;
