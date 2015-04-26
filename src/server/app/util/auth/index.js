'use strict';

var passport = require('passport');
var q = require('q');

var LocalStrategy = require('passport-local').Strategy;

var pr = require('app/util/pr');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/util/auth/index');


// Configure user serialisation
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // TODO - check if it is in redis, if it is read fro there, otherwise store there
  q(pr.pr.auth.user.find(id))
  .then(function(user) {
    done(undefined, user);
  })
  .fail(function(error) {
    logger.error('pr.pr.auth.user.find(' + id + ') failed with error: ' + error);
    done(error , undefined);
  });
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  // TODO is process.nextTick nec? - copied from https://scotch.io/tutorials/easy-node-authentication-setup-and-local
  process.nextTick(function() {
    q(pr.pr.auth.user.find({
      where: { email: email }
    }))
    .then(function(user) {
      if(user === null) { // email not found, create the user
        q(pr.pr.auth.user.create({
          email: email,
          password: pr.pr.auth.user.hash_password(password)
        }))
        .then(function(user) {
          return done(null, user);
        })
        .fail(function(error) {
          logger.error('local-signup callback for email ' + email + ' failed user creation: ' + error);
          return done(error, undefined);
        });
      }
      else {
        return done(null, false, req.flash('signup_message', 'An account with that email address already exists'));
      }
    })
    .fail(function(error) {
      logger.error('local-signup callback for ' + email + ' failed while checking if email already used: ' + error);
      return done(error, undefined);
    });
  });
}));

module.exports = {
  passport: passport
};
