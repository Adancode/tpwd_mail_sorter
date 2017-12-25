var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res) {
     res.render('index');
});

// The function below prevents users from going to the dashboard if they are not logged in (which they could otherwise do by going to localhost:3000)
function ensureAuthenticated(req, res, next) {
     if(req.isAuthenticated()){
          return next();
     } else {
          // req.flash('error_msg', 'You are not logged in');
          res.redirect('/users/login');
     }
}

module.exports = router;
