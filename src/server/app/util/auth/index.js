'use strict';

var passport = require('passport');
var q = require('q');
var _ = require('underscore');

var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var pr = require('app/util/pr');
var api_util_config = require('app/config/api_util');
var server_config = require('app/config/server');
var user_config = require('app/config/user');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/util/auth/index');

/**
 * Returns the facebook auth callback URL (assembled from server and user configs)
 */
function get_fb_auth_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.fb.auth_callback_url;
}

/**
 * Returns the facebook connect callback URL (assembled from server and user configs)
 */
function get_fb_connect_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.fb.connect_callback_url;
}

/**
 * Returns the google auth callback URL (assembled from server and user configs)
 */
function get_google_auth_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.google.auth_callback_url;
}

/**
 * Returns the google connect callback URL (assembled from server and user configs)
 */
function get_google_connect_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.google.connect_callback_url;
}

/**
 * Returns the twitter auth callback URL (assembled from server and user configs)
 */
function get_twitter_auth_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.twitter.auth_callback_url;
}

/**
 * Returns the twitter connect callback URL (assembled from server and user configs)
 */
function get_twitter_connect_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.twitter.connect_callback_url;
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
  q(pr.pr.auth.user.find_with_id(id, 'all'))
  .then(function(user) {
    done(undefined, user);
  })
  .fail(function(err) {
    logger.error('pr.pr.auth.user.find(' + id + ') failed with error: ' + err);
    done(err , undefined);
  });
});

/**
 * passport.js local-signup strategy
 */
passport.use('local-signup', new LocalStrategy({
  usernameField: user_config.local.username_field,
  passwordField: user_config.local.password_field,
  passReqToCallback: true
}, function local_signup_strategy_callback(req, email, password, done) {
  // Why process.nextTick nec? (copied from https://scotch.io/tutorials/easy-node-authentication-setup-and-local)
  // Prob: "Quora: What does process.nextTick(callback) actually do in Node.js?" - answer by Aran Mulholland, bullet 3
  process.nextTick(function() {
    q(pr.pr.auth.user.find_with_local_username(email, 'all'))
    .then(function(user) {
      if(user === null) { // email not found, create the user
        var user_attrs = {};
        user_attrs[user_config.local.username_field] = email;
        user_attrs[user_config.local.password_field] = pr.pr.auth.user.hash_password(password);
        q(pr.pr.auth.user.create(user_attrs))
        .then(function(user) {
          logger.info('local-signup -- callback created user with email: ' + email);
          return done(null, user, req.flash(api_util_config.flash_message_key, 'Account created'));
        })
        .fail(function(err) {
          // DB or validation error - do not distinguish validation or set flash because val. is also done client side
          logger.warn('local-signup -- callback for ' + email + ' failed user creation, error: ' + err);
          return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
        });
      }
      else {
        logger.warn('local-signup -- callback failed, account creation requested for existing account: ' + email);
        return done(null, false,
          req.flash(api_util_config.flash_message_key, 'An account with that email address already exists'));
      }
    })
    .fail(function(err) {
      logger.error('local-signup -- callback for ' + email + ' failed while checking if email already used: ' + err);
      return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
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
}, function local_login_strategy_callback(req, email, password, done) {
  q(pr.pr.auth.user.find_with_local_username(email, 'all'))
  .then(function(user) {
    if(user !== null) {
      if(user.check_password(password)) {
        if(user.is_active()) {
          logger.debug('local-login -- logged in: ' + email);
          return done(null, user, req.flash(api_util_config.flash_message_key, 'Logged in'));
        }
        else {
          logger.debug('local-login -- deactivated login successful: ' + email);
          return done(null, false, req.flash(api_util_config.flash_message_key,
            'Account currently deactivated, to reactivate click <a href="' + user_config.client_reactivate_path +
            '" class="js-action-link">here</a>'));
        }
      }
      else {
        logger.debug('local-login -- incorrect password: ' + email);
        return done(null, false, req.flash(api_util_config.flash_message_key, 'Incorrect password'));
      }
    }
    else {
      logger.debug('local-login -- unknown email: ' + email);
      return done(null, false, req.flash(api_util_config.flash_message_key, 'No user with that email address found'));
    }
  })
  .fail(function(err) {
    logger.error('local-login -- callback for ' + email + ' failed while querying for user: ' + err);
    return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
  });
}));

/**
 * passport.js local-connect strategy
 */
passport.use('local-connect', new LocalStrategy({
  usernameField: user_config.local.username_field,
  passwordField: user_config.local.password_field,
  passReqToCallback: true
}, function local_connect_strategy_callback(req, email, password, done) {
  q(pr.pr.auth.user.find_with_local_username(email, 'all'))
  .then(function(user_with_email) {
    if(user_with_email === null) { // that email address is not used - add it to logged in a/c along with the password
      var user_attrs = {};
      user_attrs[user_config.local.username_field] = email;
      user_attrs[user_config.local.password_field] = pr.pr.auth.user.hash_password(password);
      q(req.user.connect_local_and_save(user_attrs))
      .then(function(updated_user) {
        logger.debug('local-connect -- email added to user: ' + JSON.stringify(updated_user));
        done(null, updated_user, req.flash(api_util_config.flash_message_key, 'Email address added'));
      })
      .fail(function(err) {
        logger.warn('local-connect -- callback for ' + JSON.stringify(req.user) + ' failed to save updated user to DB');
        return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
      });
    }
    else {
      logger.debug('local-connect -- email already in use by user: ' + JSON.stringify(user_with_email));
      return done(null, false, req.flash(api_util_config.flash_message_key,
        'Email address already in use by another profile'));
    }
  })
  .fail(function(err) {
    logger.error('local-connect -- callback for ' + email + ' failed while query\'ing for user: ' + err);
    return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
  });
}));

/**
 * passport.js Facebook access strategy
 */
passport.use('fb-access', new FacebookStrategy({
  clientID: user_config.fb.client_id,
  clientSecret: user_config.fb.client_secret,
  callbackURL: get_fb_auth_callback_url(),
  passReqToCallback: true
}, function fb_access_strategy_callback(req, token, refresh_token, profile, done) {
  q(pr.pr.auth.user.find_with_fb_id(profile.id, 'all'))
  .then(function(user) {
    if(user !== null) { // user found - log in or offer to reactivate
      if(user.is_active()) {
        logger.debug('fb-access -- callback found existing user, logging in: ' + JSON.stringify(user));
        return done(null, user, req.flash(api_util_config.flash_message_key, 'Logged in via Facebook'));
      }
      else {
        logger.debug('fb-access -- deactivated login successful: ' + JSON.stringify(user));
        return done(null, false, req.flash(api_util_config.flash_message_key,
          'Account currently deactivated, to reactivate click <a href="' + user_config.client_reactivate_path +
          '" class="js-action-link">here</a>'));
      }
    }
    else { // user not found - create account
      logger.debug('fb-access -- callback user not found, creating from: ' + JSON.stringify(profile));
      q(pr.pr.auth.user.create_from_fb_and_save(profile, token))
      .then(function(user) {
        logger.info('fb-access -- user created: ' + profile.id + ' / ' + profile.name.givenName + ' / ' +
          profile.name.familyName);
        return done(null, user, req.flash(api_util_config.flash_message_key, 'Account created'));
      })
      .fail(function(err) {
        // DB or validation error - do not distinguish validation or set flash because that is also done client side
        logger.warn('fb-access -- callback for ' + profile.id + ' / ' + profile.name.givenName + ' / ' +
          profile.name.familyName + ' failed user creation, error: ' + err);
        return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
      });
    }
  })
  .fail(function(err) {
    logger.error('fb-access -- callback for token ' + token + ' failed while querying for user, error: ' + err);
    return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
  });
}));

/**
 * passport.js Facebook connect strategy
 */
passport.use('fb-connect', new FacebookStrategy({
  clientID: user_config.fb.client_id,
  clientSecret: user_config.fb.client_secret,
  callbackURL: get_fb_connect_callback_url(),
  passReqToCallback: true
}, function fb_connect_strategy_callback(req, token, token_secret, profile, done) {
  if(req.user) {
    q(pr.pr.auth.user.find_with_fb_id(profile.id, 'all'))
    .then(function(fb_user) {
      if(fb_user === null) { // no account for this fb id, update user and send back to client or error
        q(req.user.connect_fb_and_save(profile, token))
        .then(function(updated_user) {
          logger.debug('fb-connect -- callback updated user, redirecting to profile');
          done(null, updated_user, req.flash(api_util_config.flash_message_key, 'Facebook account connected'));
        })
        .fail(function(err) {
          logger.error('fb-connect -- callback failed to save updated user object to DB, error: ' + err);
          done(null, req.user);
        });
      }
      else { // this google id already has an account
        logger.warn('fb-connect -- facebook id  ' + fb_user.fb_id + ' already in use');
        done(null, req.user, req.flash(api_util_config.flash_message_key,
          'Facebook account already connected to another profile'));
      }
    })
    .fail(function(err) {
      logger.error('fb-connect -- query for facebook id ' + profile.id + ' failed w/ server error: ' +
        err);
      done(null, req.user, req.flash(api_util_config.flash_message_key, 'Server error'));
    });
  }
  else {
    logger.error('fb-connect -- callback failed for facebook id ' + profile.id + ' - no user on req');
    return done(null, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
  }
}));

/**
 * passport.js Google access strategy
 */
passport.use('google-access', new GoogleStrategy({
  clientID: user_config.google.client_id,
  clientSecret: user_config.google.client_secret,
  callbackURL: get_google_auth_callback_url(),
  passReqToCallback: true
}, function google_access_strategy_callback(req, token, refresh_token, profile, done) {
  q(pr.pr.auth.user.find_with_google_id(profile.id, 'all'))
  .then(function(user) {
    if(user !== null) { // user found - log in or offer to reactivate
      if(user.is_active()) {
        logger.debug('google-access -- found existing user, logging in: ' + JSON.stringify(user));
        return done(null, user, req.flash(api_util_config.flash_message_key, 'Logged in via Google'));
      }
      else {
        logger.debug('google-access -- deactivated login successful: ' + JSON.stringify(user));
        return done(null, false, req.flash(api_util_config.flash_message_key,
          'Account currently deactivated, to reactivate click <a href="' + user_config.client_reactivate_path +
          '" class="js-action-link">here</a>'));
      }
    }
    else { // user not found - create account
      logger.debug('google-access -- user not found, creating from: ' + JSON.stringify(profile));
      q(pr.pr.auth.user.create_from_google_and_save(profile, token))
      .then(function(user) {
        logger.info('google-access -- user created: ' + profile.id + ' / ' + profile.display_name);
        return done(null, user, req.flash(api_util_config.flash_message_key, 'Account created'));
      })
      .fail(function(err) {
        // DB or validation error - do not distinguish validation or set flash because that is also done client side
        logger.warn('google-access -- callback for ' + profile.id + ' / ' + profile.display_name +
          ' failed user creation, error: ' + err);
        return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
      });
    }
  })
  .fail(function(err) {
    logger.error('google-access -- callback for token ' + token + ' failed while querying for user, error: ' + err);
    return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
  });
}));

/**
 * passport.js Google connect strategy
 */
passport.use('google-connect', new GoogleStrategy({
  clientID: user_config.google.client_id,
  clientSecret: user_config.google.client_secret,
  callbackURL: get_google_connect_callback_url(),
  passReqToCallback: true
}, function google_connect_strategy_callback(req, token, token_secret, profile, done) {
  if(req.user) {
    q(pr.pr.auth.user.find_with_google_id(profile.id, 'all'))
    .then(function(google_user) {
      if(google_user === null) { // no account for this google id, update user and send back to client or error
        q(req.user.connect_google_and_save(profile, token))
        .then(function(updated_user) {
          logger.debug('google-connect -- user updated, redirecting to profile');
          done(null, updated_user, req.flash(api_util_config.flash_message_key, 'Google account connected'));
        })
        .fail(function(err) {
          logger.error('google-connect -- failed to save updated user object to DB, error: ' + err);
          done(null, req.user, req.flash(api_util_config.flash_message_key, 'Server error'));
        });
      }
      else { // this google id already has an account
        logger.warn('google-connect -- google id  ' + google_user.google_id + ' already in use');
        done(null, req.user, req.flash(api_util_config.flash_message_key,
          'Google account already connected to another profile'));
      }
    })
    .fail(function(err) {
      logger.error('google-connect -- query for google id ' + profile.id + ' failed w/ server error: ' + err);
      done(null, req.user, req.flash(api_util_config.flash_message_key, 'Server error'));
    });
  }
  else {
    logger.error('google-connect -- callback failed for google id ' + profile.id + ' - no user on req');
    return done(null, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
  }
}));

/**
 * passport.js Twitter access strategy
 */
passport.use('twitter-access', new TwitterStrategy({
  consumerKey: user_config.twitter.consumer_key,
  consumerSecret: user_config.twitter.consumer_secret,
  callbackURL: get_twitter_auth_callback_url(),
  passReqToCallback: true
}, function twitter_access_strategy_callback(req, token, token_secret, profile, done) {
  q(pr.pr.auth.user.find_with_twitter_id(profile.id, 'all'))
  .then(function(user) {
    if(user !== null) {  // user found - log in or offer to reactivate
      if(user.is_active()) {
        logger.debug('twitter-access -- found existing user, logging in: ' + JSON.stringify(user));
        return done(null, user, req.flash(api_util_config.flash_message_key, 'Logged in via Twitter'));
      }
      else {
        logger.debug('twitter-access -- deactivated login successful: ' + JSON.stringify(user));
        return done(null, false, req.flash(api_util_config.flash_message_key,
          'Account currently deactivated, to reactivate click <a href="' + user_config.client_reactivate_path +
          '" class="js-action-link">here</a>'));
      }
    }
    else { // user not found - create account
      logger.debug('twitter-access -- user not found, creating from: ' + JSON.stringify(profile));
      q(pr.pr.auth.user.create_from_twitter_and_save(profile, token))
      .then(function(user) {
        logger.info('twitter-access -- user created: ' + profile.id  + ' / ' + profile.username);
        return done(null, user, req.flash(api_util_config.flash_message_key, 'Account created'));
      })
      .fail(function(err) {
        // DB or validation error - do not distinguish validation or set flash because that is also done client side
        logger.warn('twitter-access -- callback for ' + profile.id + ' / ' + profile.username +
          ' failed user creation, error: ' + err);
        return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Account creation failed'));
      });
    }
  })
  .fail(function(err) {
    logger.error('twitter-access -- callback for token ' + token + ' failed while querying for user, error: ' + err);
    return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
  });
}));

/**
 * passport.js Twitter connect strategy
 */
passport.use('twitter-connect', new TwitterStrategy({
  consumerKey: user_config.twitter.consumer_key,
  consumerSecret: user_config.twitter.consumer_secret,
  callbackURL: get_twitter_connect_callback_url(),
  passReqToCallback: true
}, function twitter_connect_strategy_callback(req, token, token_secret, profile, done) {
  if(req.user) {
    q(pr.pr.auth.user.find_with_twitter_id(profile.id, 'all'))
    .then(function(twitter_user) {
      if(twitter_user === null) { // no account for this twitter id, update user and send back to client or error
        q(req.user.connect_twitter_and_save(profile, token))
        .then(function(updated_user) {
          logger.debug('twitter-connect -- user updated, redirecting to profile');
          done(null, updated_user, req.flash(api_util_config.flash_message_key, 'Twitter account connected'));
        })
        .fail(function(err) {
          logger.error('twitter-connect -- failed to save updated user object to DB, error: ' + err);
          done(null, req.user, req.flash(api_util_config.flash_message_key, 'Server error'));
        });
      }
      else { // this twitter id already has an account
        logger.warn('twitter-connect -- twitter id  ' + twitter_user.twitter_id + ' already in use');
        done(null, req.user, req.flash(api_util_config.flash_message_key,
          'Twitter account already connected to another profile'));
      }
    })
    .fail(function(err) {
      logger.error('twitter-connect -- query for twitter id ' + profile.id + ' failed w/ error: ' + err);
      done(null, req.user, req.flash(api_util_config.flash_message_key, 'Server error'));
    });
  }
  else {
    logger.error('twitter-connect -- callback failed for twitter id ' + profile.id + ' - no user on req');
    return done(null, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
  }
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
