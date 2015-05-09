'use strict';

var passport = require('passport');
var q = require('q');

var LocalStrategy = require('passport-local').Strategy;

var pr = require('app/util/pr');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/util/auth/index');


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
  // Why process.nextTick nec? (copied from https://scotch.io/tutorials/easy-node-authentication-setup-and-local)
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
          logger.info('local-signup user created: ' + email);
          return done(null, user);
        })
        .fail(function(error) {
          // DB or validation error - do not distinguish validation or set flash because that is also done client side
          logger.warn('local-signup callback for email ' + email + ' failed user creation: ' + error);
          return done(error, undefined);
        });
      }
      else {
        logger.warn('local-signup account creation requested for existing account: ' + email);
        return done(null, false, req.flash('message', 'An account with that email address already exists'));
      }
    })
    .fail(function(error) {
      logger.error('local-signup callback for ' + email + ' failed while checking if email already used: ' + error);
      return done(error, undefined);
    });
  });
}));

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  q(pr.pr.auth.user.find({
    where: { email: email }
  }))
  .then(function(user) {
    if(user !== null) {
      if(user.check_password(password)) {
        logger.debug('local-signup logged in: ' + email);
        return done(null, user);
      }
      else {
        logger.debug('local-signup incorrect password: ' + email);
        return done(null, false, req.flash('message', 'Incorrect password'));
      }
    }
    else {
      logger.debug('local-signup unknown email: ' + email);
      return done(null, false, req.flash('message', 'No user with that email address found'));
    }
  })
  .fail(function(error) {
    logger.error('local-login callback for ' + email + ' failed while loading user: ' + error);
    return done(error, undefined, req.flash('message', JSON.stringify(error)));
  });
}));

module.exports = {
  passport: passport,

  ensure_authenticated: function ensure_authenticated(req, res, next) {
    logger.debug('exports.ensure_authenticated - isAuthenticated: ' + req.isAuthenticated());
    if (req.isAuthenticated()) {
      return next();
    }
    else {
      res.status(401).redirect('/login');
    }
  },

  ensure_unauthenticated: function ensure_authenticated(req, res, next) {
    logger.debug('exports.ensure_unauthenticated - isUnauthenticated: ' + req.isUnauthenticated());
    if (req.isUnauthenticated()) {
      return next();
    }
    else {
      res.status(403).end();
    }
  }
};
