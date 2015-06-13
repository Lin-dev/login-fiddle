'use strict';

var passport = require('passport');
var q = require('q');
var _ = require('underscore');

var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var pr = require('app/util/pr');
var server_config = require('app/config/server');
var user_config = require('app/config/user');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/util/auth/index');

/**
 * Returns the facebook auth callback URL (assembled from server and user configs)
 */
function get_facebook_auth_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.facebook.auth_callback_url;
}

/**
 * Returns the google auth callback URL (assembled from server and user configs)
 */
function get_google_auth_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.google.auth_callback_url;
}

/**
 * Returns the twitter auth callback URL (assembled from server and user configs)
 */
function get_twitter_auth_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.twitter.auth_callback_url;
}

/**
 * Serialise user id only to session
 */
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

/**
 * Read all user information (as a Sequelize instance) from the main database to populate the session info
 */
passport.deserializeUser(function(id, done) {
  q(pr.pr.auth.user.find(id))
  .then(function(user) {
    done(undefined, user);
  })
  .fail(function(error) {
    logger.error('pr.pr.auth.user.find(' + id + ') failed with error: ' + error);
    done(error , undefined);
  });
});

/**
 * passport.js local-signup strategy
 */
passport.use('local-signup', new LocalStrategy({
  usernameField: user_config.local.username_field,
  passwordField: user_config.local.password_field,
  passReqToCallback: true
}, function(req, email, password, done) {
  // Why process.nextTick nec? (copied from https://scotch.io/tutorials/easy-node-authentication-setup-and-local)
  // Prob: "Quora: What does process.nextTick(callback) actually do in Node.js?" - answer by Aran Mulholland, bullet 3
  process.nextTick(function() {
    var where_object = {};
    where_object[user_config.local.username_field] = email;
    q(pr.pr.auth.user.find({ where: where_object }))
    .then(function(user) {
      if(user === null) { // email not found, create the user
        var user_attrs = {};
        user_attrs[user_config.local.username_field] = email;
        user_attrs[user_config.local.password_field] = pr.pr.auth.user.hash_password(password);
        q(pr.pr.auth.user.create(user_attrs))
        .then(function(user) {
          logger.info('local-signup user created: ' + email);
          return done(null, user);
        })
        .fail(function(error) {
          // DB or validation error - do not distinguish validation or set flash because that is also done client side
          logger.warn('local-signup callback for ' + email + ' failed user creation, error: ' + error);
          return done(error, undefined, req.flash('message', 'Account creation failed'));
        });
      }
      else {
        logger.warn('local-signup account creation requested for existing account: ' + email);
        return done(null, false, req.flash('message', 'An account with that email address already exists'));
      }
    })
    .fail(function(error) {
      logger.error('local-signup callback for ' + email + ' failed while checking if email already used: ' + error);
      return done(error, undefined, req.flash('message', 'System error'));
    });
  });
}));

/**
 * passport.js local-login strategy
 */
passport.use('local-login', new LocalStrategy({
  usernameField: user_config.local.username_field,
  passwordField: user_config.local.password_field,
  passReqToCallback: true
}, function(req, email, password, done) {
  var where_object = {};
  where_object[user_config.local.username_field] = email;
  q(pr.pr.auth.user.find({ where: where_object }))
  .then(function(user) {
    if(user !== null) {
      if(user.check_password(password)) {
        logger.debug('local-login logged in: ' + email);
        return done(null, user);
      }
      else {
        logger.debug('local-login incorrect password: ' + email);
        return done(null, false, req.flash('message', 'Incorrect password'));
      }
    }
    else {
      logger.debug('local-login unknown email: ' + email);
      return done(null, false, req.flash('message', 'No user with that email address found'));
    }
  })
  .fail(function(error) {
    logger.error('local-login callback for ' + email + ' failed while querying for user: ' + error);
    return done(error, undefined, req.flash('message', 'System error'));
  });
}));

passport.use('facebook-access', new FacebookStrategy({
  clientID: user_config.facebook.client_id,
  clientSecret: user_config.facebook.client_secret,
  callbackURL: get_facebook_auth_callback_url(),
  passReqToCallback: true
}, function(req, token, refresh_token, profile, done) {
  var where_object = { facebook_id: profile.id };
  q(pr.pr.auth.user.find({ where: where_object }))
  .then(function(user) {
    if(user !== null) { // user found - log in
      logger.debug('facebook-access callback -- Found existing user, logging in: ' + JSON.stringify(user));
      return done(null, user);
    }
    else { // user not found - create account
      logger.debug('facebook-access callback -- user not found, creating from: ' + JSON.stringify(profile));
      q(pr.pr.auth.user.create_from_facebook_and_save(profile, token))
      .then(function(user) {
        logger.info('facebook-access user created: ' + profile.id + ' / ' + profile.name.givenName + ' / ' +
          profile.name.familyName);
        return done(null, user);
      })
      .fail(function(error) {
        // DB or validation error - do not distinguish validation or set flash because that is also done client side
        logger.warn('facebook-access callback for ' + profile.id + ' / ' + profile.name.givenName + ' / ' +
          profile.name.familyName + ' failed user creation, error: ' + error);
        return done(error, undefined, req.flash('message', 'Account creation failed'));
      });
    }
  })
  .fail(function(error) {
    logger.error('facebook-access callback for token ' + token + ' failed while querying for user, error: ' + error);
    return done(error, undefined, req.flash('message', 'System error'));
  });
}));

passport.use('google-access', new GoogleStrategy({
  clientID: user_config.google.client_id,
  clientSecret: user_config.google.client_secret,
  callbackURL: get_google_auth_callback_url(),
  passReqToCallback: true
}, function(req, token, refresh_token, profile, done) {
  var where_object = { google_id: profile.id };
  q(pr.pr.auth.user.find({ where: where_object }))
  .then(function(user) {
    if(user !== null) { // user found - log in
      logger.debug('google-access callback -- Found existing user, logging in: ' + JSON.stringify(user));
      return done(null, user);
    }
    else { // user not found - create account
      logger.debug('google-access callback -- user not found, creating from: ' + JSON.stringify(profile));
      q(pr.pr.auth.user.create_from_google_and_save(profile, token))
      .then(function(user) {
        logger.info('google-access user created: ' + profile.id + ' / ' + profile.display_name);
        return done(null, user);
      })
      .fail(function(error) {
        // DB or validation error - do not distinguish validation or set flash because that is also done client side
        logger.warn('google-access callback for ' + profile.id + ' / ' + profile.display_name +
          ' failed user creation, error: ' + error);
        return done(error, undefined, req.flash('message', 'Account creation failed'));
      });
    }
  })
  .fail(function(error) {
    logger.error('google-access callback for token ' + token + ' failed while querying for user, error: ' + error);
    return done(error, undefined, req.flash('message', 'System error'));
  });
}));

passport.use('twitter-access', new TwitterStrategy({
  consumerKey: user_config.twitter.consumer_key,
  consumerSecret: user_config.twitter.consumer_secret,
  callbackURL: get_twitter_auth_callback_url(),
  passReqToCallback: true
}, function(req, token, token_secret, profile, done) {
  var where_object = { twitter_id: profile.id };
  q(pr.pr.auth.user.find({ where: where_object }))
  .then(function(user) {
    if(user !== null) { // user found - log in
      logger.debug('twitter-access callback -- Found existing user, logging in: ' + JSON.stringify(user));
      return done(null, user);
    }
    else { // user not found - create account
      logger.debug('twitter-access callback -- user not found, creating from: ' + JSON.stringify(profile));
      q(pr.pr.auth.user.create_from_twitter_and_save(profile, token))
      .then(function(user) {
        logger.info('twitter-access user created: ' + profile.id  + ' / ' + profile.username);
        return done(null, user);
      })
      .fail(function(error) {
        // DB or validation error - do not distinguish validation or set flash because that is also done client side
        logger.warn('twitter-access callback for ' + profile.id + ' / ' + profile.username +
          ' failed user creation, error: ' + error);
        return done(error, undefined, req.flash('message', 'Account creation failed'));
      });
    }
  })
  .fail(function(error) {
    logger.error('twitter-access callback for token ' + token + ' failed while querying for user, error: ' + error);
    return done(error, undefined, req.flash('message', 'System error'));
  });
}));

module.exports = {
  passport: passport,

  /**
   * Middleware generator functions relating to authentication
   */
  mw_gen: {
    /**
     * Generates a middleware function that checks req.body has keys for all strings in required_fields, an array
     * TODO: Is this middleware general? Should it be moved into some sort of general middleware library?
     * @param  {Array} required_fields An array of strings
     * @return {Function}              A middleware function that can be passed to an Express router
     */
    check_post_has_req_fields: function check_post_has_req_fields(required_fields) {
      return function(req, res, next) {
        _.each(required_fields, function(req_field) {
          if(req.body[req_field] === undefined) {
            logger.warn('exports.mw_gen.check_post_has_req_fields -- Required post variable undefined: ' + req_field);
          }
        });
        next();
      };
    }
  },

  /**
   * Middleware relating to authentication
   */
  mw: {
    /**
     * Call next if the requester is authenticated otherwise send 403
     */
    ensure_auth: function ensure_auth(req, res, next) {
      logger.debug('exports.mw.ensure_auth - isAuthenticated: ' + req.isAuthenticated());
      if (req.isAuthenticated()) {
        return next();
      }
      else {
        // Don't redirect - this is just an API call so redirects if unauthenticated should be checked/happen client side
        res.status(403).end(); // slightly weird use of 403 but sending something back makes debugging easier
      }
    },

    /**
     * Call next if the requester is unauthenticated otherwise send 403
     */
    ensure_unauth: function ensure_unauth(req, res, next) {
      logger.debug('exports.mw.ensure_unauth - isUnauthenticated: ' + req.isUnauthenticated());
      if (req.isUnauthenticated()) {
        return next();
      }
      else {
        // Don't redirect - this is just an API call so redirects if authenticated should be checked/happen client side
        res.status(403).end();
      }
    },

    /**
     * Middleware that sets a client-visible cookie if a user is logged in, this allows the client-side app to respond
      * intelligently to requests for views that require the user to be logged in (or not).
    */
    set_client_auth_status_cookie: function set_logged_in_cookie_if_authenticated(req, res, next) {
      if(req.isAuthenticated()) {
        res.cookie(user_config.logged_in_cookie_name, 'true', { maxAge: user_config.session.cookie.maxAge });
      }
      else {
        res.cookie(user_config.logged_in_cookie_name, 'false', { maxAge: user_config.session.cookie.maxAge });
      }
      next();
    },

    /**
     * Initialise session with start date
     * TODO This is not required - just used in session api example/fiddle
     */
    set_session_start_date: function set_session_start_date(req, res, next) {
      if(!req.session.start) {
        req.session.start = new Date();
      }
      next();
    }
  }
};
