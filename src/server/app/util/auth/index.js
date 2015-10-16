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
    user_config.fb.auth_callback_path;
}

/**
 * Returns the facebook reactivate callback URL (assembled from server and user configs)
 */
function get_fb_reactivate_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.fb.reactivate_callback_path;
}

/**
 * Returns the facebook connect callback URL (assembled from server and user configs)
 */
function get_fb_connect_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.fb.connect_callback_path;
}

/**
 * Returns the google auth callback URL (assembled from server and user configs)
 */
function get_google_auth_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.google.auth_callback_path;
}

/**
 * Returns the google reactivate callback URL (assembled from server and user configs)
 */
function get_google_reactivate_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.google.reactivate_callback_path;
}

/**
 * Returns the google connect callback URL (assembled from server and user configs)
 */
function get_google_connect_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.google.connect_callback_path;
}

/**
 * Returns the twitter auth callback URL (assembled from server and user configs)
 */
function get_twitter_auth_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.twitter.auth_callback_path;
}

/**
 * Returns the twitter reactivate callback URL (assembled from server and user configs)
 */
function get_twitter_reactivate_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.twitter.reactivate_callback_path;
}

/**
 * Returns the twitter connect callback URL (assembled from server and user configs)
 */
function get_twitter_connect_callback_url() {
  return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
    user_config.twitter.connect_callback_path;
}

/**
 * Returns a function which can be executed as a passport.js strategy callback for site access and account creation.
 *
 * The returned method checks if the user is already present in the DB. If they are and they are active then they are
 * logged in. If they are not then the account is created and the user logged in. Otherwise an appropriate error flash
 * message is set and the strategy is not successful.
 *
 * The options argument passed to this method must have the following fields defined:
 * - user_find_fn:   A function which takes the normalised profile.id from passport.js and returns a user object promise
 * - user_create_fn: A function which takes the normalised profile object and token from passport and returns a promise
 *                   for saving the user
 * - login_message:  The flash message to set for display in the client application on successful login
 *
 * @param  {Object}   options An options object as described in the function summary above
 * @return {Function}         A function which can be executed as a passport.js strategy callback.
 */
function make_passport_access_strategy_callback(options) {
  var fatal_error = false;
  if(!options.user_find_fn || typeof options.user_find_fn !== 'function') {
    logger.fatal('make_passport_access_strategy_callback -- typeof options.user_find_fn:' +
      typeof options.user_find_fn);
    fatal_error = true;
  }
  if(!options.user_create_fn || typeof options.user_create_fn !== 'function') {
    logger.fatal('make_passport_access_strategy_callback -- typeof options.user_create_fn:' +
      typeof options.user_create_fn);
    fatal_error = true;
  }
  if(!options.login_message) {
    logger.error('make_passport_access_strategy_callback -- options.login_message: ' + options.login_message);
  }
  if(fatal_error) {
    throw new Error('make_passport_access_strategy_callback -- fatal error, aborting - see logs');
  }

  return function passport_access_strategy_callback(req, token, refresh_token, profile, done) {
    q(options.user_find_fn(profile.id))
    .then(function(user) {
      if(user !== null) { // user found - log in or offer to reactivate
        if(user.is_active()) {
          logger.debug('make_passport_access_strategy_callback -- found existing user, logging in: ' +
            JSON.stringify(user));
          return done(null, user, req.flash(api_util_config.flash_message_key, options.login_message));
        }
        else {
          logger.debug('make_passport_access_strategy_callback -- deactivated login was successful: ' +
            JSON.stringify(user));
          return done(null, false, req.flash(api_util_config.flash_message_key,
            'Account currently deactivated, to reactivate click <a href="' + user_config.client_reactivate_path +
            '" class="js-action-link">here</a>'));
        }
      }
      else { // user not found - create account
        logger.debug('make_passport_access_strategy_callback -- user not found, creating from: ' +
          JSON.stringify(profile));
        q(options.user_create_fn(profile, token))
        .then(function(user) {
          logger.info('make_passport_access_strategy_callback -- user created: ' + profile.id + ' / ' +
            profile.displayName);
          return done(null, user, req.flash(api_util_config.flash_message_key, 'Account created'));
        })
        .fail(function(err) {
          // DB or validation error - do not distinguish validation or set flash because that is also done client side
          logger.warn('make_passport_access_strategy_callback -- user_create_fn for ' + profile.id + ' / ' +
            profile.displayName + ' failed user creation, error: ' + err);
          return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
        });
      }
    })
    .fail(function(err) {
      logger.error('make_passport_access_strategy_callback -- callback for token ' + token +
        ' failed while querying for user, error: ' + err);
      return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
    });
  };
}

/**
 * Returns a function which can be executed as a passport.js strategy callback for account reactivation, creation and
 * login.
 *
 * The returned method logs in any valid user that is passed to it. If they are deactivated they are also reactivated.
 * If the user account does not create it is created. In all cases, including error modes, an appropriate flash message
 * is set fot the client to display.
 *
 * The options argument passed to this method must have the following fields defined:
 * - user_find_fn:   A function which takes the normalised profile.id from passport.js and returns a user object promise
 * - user_create_fn: A function which takes the normalised profile object and token from passport and returns a promise
 *                   for saving the user
 * - react_message:  The flash message to set for display in the client application on successful reactivation
 * - login_message:  The flash message to set for display in the client application on successful login
 *
 * @param  {Object}   options An options object as described in the function summary above
 * @return {Function}         A function which can be executed as a passport.js strategy callback.
 */
function make_passport_reactivate_strategy_callback(options) {
  var fatal_error = false;
  if(!options.user_find_fn || typeof options.user_find_fn !== 'function') {
    logger.fatal('make_passport_reactivate_strategy_callback -- typeof options.user_find_fn:' +
      typeof options.user_find_fn);
    fatal_error = true;
  }
  if(!options.user_create_fn || typeof options.user_create_fn !== 'function') {
    logger.fatal('make_passport_reactivate_strategy_callback -- typeof options.user_create_fn:' +
      typeof options.user_create_fn);
    fatal_error = true;
  }
  if(!options.react_message) {
    logger.error('make_passport_reactivate_strategy_callback -- options.react_message: ' + options.react_message);
  }
  if(!options.login_message) {
    logger.error('make_passport_reactivate_strategy_callback -- options.login_message: ' + options.login_message);
  }
  if(fatal_error) {
    throw new Error('make_passport_reactivate_strategy_callback -- fatal error, aborting - see logs');
  }

  return function passport_reactivate_strategy_callback(req, token, refresh_token, profile, done) {
    q(options.user_find_fn(profile.id))
    .then(function(user) {
      if(user !== null) {
        if(!user.is_active()) {
          q(user.reactivate_and_save())
          .then(function(activated_user) {
            logger.debug('passport_reactivate_strategy_callback -- reactivated user and logged in: ' +
              JSON.stringify(activated_user));
            return done(null, activated_user, req.flash(api_util_config.flash_message_key, options.react_message));
          })
          .fail(function(err) {
            logger.error('passport_reactivate_strategy_callback -- failed to reactivate user: ' + err);
            return done(null, false, req.flash('Server error - failed to reactivate account'));
          });
        }
        else {
          logger.debug('passport_reactivate_strategy_callback -- user already active, logging in: ' +
            JSON.stringify(user));
          return done(null, user, req.flash(api_util_config.flash_message_key, options.login_message));
        }
      }
      else { // user not found - create account
        logger.debug('passport_reactivate_strategy_callback -- user not found, creating from: ' +
          JSON.stringify(profile));
        q(options.user_create_fn(profile, token))
        .then(function(user) {
          logger.info('passport_reactivate_strategy_callback -- user created: ' + profile.id + ' / ' +
            profile.name.givenName + ' / ' + profile.name.familyName);
          return done(null, user, req.flash(api_util_config.flash_message_key, 'Account created'));
        })
        .fail(function(err) {
          // DB or validation error - do not distinguish validation or set flash because that is also done client side
          logger.warn('passport_reactivate_strategy_callback -- failed for ' + profile.id + ' / ' +
            profile.name.givenName + ' / ' + profile.name.familyName + ' user creation, error: ' + err);
          return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
        });
      }
    })
    .fail(function(err) {
      logger.error('passport_reactivate_strategy_callback -- failed for token ' + token +
        ' while querying for user, error: ' + err);
      return done(err, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
    });
  };
}

/**
 * Returns a function which can be executed as a passport.js strategy callback to connect a logged in user to another
 * provider.
 *
 * Checks if the connecting profile ID is already in the DB - if not, connects the logged in user to this account and
 * display a flash message, otherwise just display a flash error message
 *
 * The options argument passed to this method must have the following fields defined:
 * - provider_find_fn: A function which takes the normalised profile.id from the provider and returns a user object if
 *                     one exists with that provider ID already or null otherwise
 * - user_connect_fn:  A function which takes the normalised profile object and token from passport and returns a
 *                     promise for saving the user
 * - connect_message:  The flash message to set for display in the client application on successful connection
 * - already_message:  The flash message to set for display in the client application if the account is already
 *                     connected to another LF user account
 *
 * @param  {Object}   options An options object as described in the function summary above
 * @return {Function}         A function which can be executed as a passport.js strategy callback.
 */
function make_passport_connect_strategy_callback(options) {
  var fatal_error = false;
  if(!options.provider_find_fn || typeof options.provider_find_fn !== 'function') {
    logger.fatal('make_passport_connect_strategy_callback -- typeof options.provider_find_fn:' +
      typeof options.provider_find_fn);
    fatal_error = true;
  }
  if(!options.user_connect_fn || typeof options.user_connect_fn !== 'function') {
    logger.fatal('make_passport_connect_strategy_callback -- typeof options.user_connect_fn:' +
      typeof options.user_connect_fn);
    fatal_error = true;
  }
  if(!options.connect_message) {
    logger.error('make_passport_connect_strategy_callback -- options.connect_message: ' + options.connect_message);
  }
  if(!options.already_message) {
    logger.error('make_passport_connect_strategy_callback -- options.already_message: ' + options.already_message);
  }
  if(fatal_error) {
    throw new Error('make_passport_connect_strategy_callback -- fatal error, aborting - see logs');
  }

  return function passport_connect_strategy_callback(req, token, token_secret, profile, done) {
    if(req.user) {
      q(options.provider_find_fn(profile.id))
      .then(function(user_from_provider) {
        if(user_from_provider === null) { // no account for this provicer id so update user account with provider info
          q(options.user_connect_fn(profile, token))
          .then(function(updated_user) {
            logger.debug('passport_connect_strategy_callback -- updated user, redirecting to profile');
            done(null, updated_user, req.flash(api_util_config.flash_message_key, options.connect_message));
          })
          .fail(function(err) {
            logger.error('passport_connect_strategy_callback -- ' +
              'failed to save updated user object to DB, error: ' + err);
            done(null, req.user, req.flash(api_util_config.flash_message_key, 'Server error'));
          });
        }
        else { // there is already a LF account for this provider
          logger.warn('passport_connect_strategy_callback -- provider id ' + profile.id + ' already in use');
          done(null, req.user, req.flash(api_util_config.flash_message_key, options.already_message));
        }
      })
      .fail(function(err) {
        logger.error('passport_connect_strategy_callback -- ' +
          ' query for provider id ' + profile.id + ' failed w/ server error: ' + err);
        done(null, req.user, req.flash(api_util_config.flash_message_key, 'Server error'));
      });
    }
    else {
      logger.error('passport_connect_strategy_callback -- ' +
        'callback failed for provider id ' + profile.id + ' - no user on req');
      return done(null, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
    }
  };
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
  email = email.trim();
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
  var make_process_user_login = function make_process_user_login(user) {
    return function process_user_login(is_pw_correct) {
      if(is_pw_correct) {
        if(user.is_active()) {
          logger.debug('local-login -- logged in: ' + email);
          return done(null, user, req.flash(api_util_config.flash_message_key, 'Logged in'));
        }
        else {
          logger.debug('local-login -- deactivated login successful: ' + email);
          return done(null, false, req.flash(api_util_config.flash_message_key, 'Account currently deactivated, to ' +
            ' reactivate click <a href="' + user_config.client_reactivate_path + '" class="js-action-link">here</a>'));
        }
      }
      else {
        logger.debug('local-login -- incorrect password: ' + email);
        return done(null, false, req.flash(api_util_config.flash_message_key, 'Incorrect password'));
      }
    };
  };

  var catch_error_in_password_check = function catch_error_in_password_check(err) {
    logger.error('local-login - user.check_password_with_rate_limiting failed with error: ' + err);
    return done(null, false, req.flash(api_util_config.flash_message_key, 'Server error'));
  };

  var catch_error_in_find = function catch_error_in_find(err) {
    logger.error('local-login -- callback for ' + email + ' failed while querying for user: ' + JSON.stringify(err));
    return done(err, false, req.flash(api_util_config.flash_message_key, 'Server error'));
  };

  email = email.trim();
  q(pr.pr.auth.user.find_with_local_username(email, 'all'))
  .then(function(user) {
    if(user !== null) {
      q(user.check_password_with_rate_limiting(password))
      .then(make_process_user_login(user))
      .fail(catch_error_in_password_check);
    }
    else {
      logger.debug('local-login -- unknown email: ' + email);
      return done(null, false, req.flash(api_util_config.flash_message_key, 'No user with that email address found'));
    }
  })
  .fail(catch_error_in_find);
}));

/**
 * passport.js local-reactivate strategy - reactivates user account if not active and logs them in, else just logs in
 */
passport.use('local-reactivate', new LocalStrategy({
  usernameField: user_config.local.username_field,
  passwordField: user_config.local.password_field,
  passReqToCallback: true
}, function local_reactivate_strategy_callback(req, email, password, done) {
  logger.trace('local-reactivate callback -- enter');
  email = email.trim();
  q(pr.pr.auth.user.find_with_local_username(email, 'all'))
  .then(function(user) {
    if(user !== null) {
      q(user.check_password_with_rate_limiting(password))
      .then(function(is_pw_correct) {
        if(is_pw_correct) {
          if(!user.is_active()) {
            q(user.reactivate_and_save())
            .then(function(activated_user) {
              logger.debug('local-reactivate -- reactivated user and logged in: ' + email);
              return done(null, activated_user, req.flash(api_util_config.flash_message_key,
                'Reactivated and logged in'));
            })
            .fail(function(err) {
              logger.error('local-reactivate -- failed to reactivate user: ' + err);
              return done(null, false, req.flash('Server error - failed to reactivate account'));
            });
          }
          else {
            logger.debug('local-reactivate -- user already active, logged in: ' + email);
            return done(null, user, req.flash(api_util_config.flash_message_key, 'Logged in'));
          }
        }
        else {
          logger.debug('local-reactivate -- incorrect password: ' + email);
          return done(null, false, req.flash(api_util_config.flash_message_key, 'Incorrect password'));
        }
      })
      .fail(function(err) {
        logger.error('local-reactivate - user.check_password_with_rate_limiting failed with error: ' + err);
        return done(null, false, req.flash(api_util_config.flash_message_key, 'Server error'));
      });
    }
    else {
      logger.debug('local-reactivate -- unknown email: ' + email);
      return done(null, false, req.flash(api_util_config.flash_message_key, 'No user with that email address found'));
    }
  })
  .fail(function(err) {
    logger.error('local-reactivate -- callback for ' + email + ' failed while querying for user: ' + err);
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
  email = email.trim();
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
  profileFields: user_config.fb.profile_fields,
  passReqToCallback: true
}, function fb_access_strategy_callback(req, token, refresh_token, profile, done) {
  (make_passport_access_strategy_callback({
    user_find_fn: function(id) { return pr.pr.auth.user.find_with_fb_id(id, 'all'); },
    user_create_fn: function(profile, token) { return pr.pr.auth.user.create_from_fb_and_save(profile, token); },
    login_message: 'Logged in via Facebook'
  }))(req, token, refresh_token, profile, done);
}));

/**
 * passport.js Facebook reactivate strategy - react's user account if not active and logs them in, else just logs in
 */
passport.use('fb-reactivate', new FacebookStrategy({
  clientID: user_config.fb.client_id,
  clientSecret: user_config.fb.client_secret,
  callbackURL: get_fb_reactivate_callback_url(),
  profileFields: user_config.fb.profile_fields,
  passReqToCallback: true
}, function fb_reactivate_strategy_callback(req, token, refresh_token, profile, done) {
  (make_passport_reactivate_strategy_callback({
    user_find_fn: function(id) { return pr.pr.auth.user.find_with_fb_id(id, 'all'); },
    user_create_fn: function(profile, token) { return pr.pr.auth.user.create_from_fb_and_save(profile, token); },
    react_message: 'Reactivated and logged in via Facebook',
    login_message: 'Logged in via Facebook'
  }))(req, token, refresh_token, profile, done);
}));

/**
 * passport.js Facebook connect strategy
 */
passport.use('fb-connect', new FacebookStrategy({
  clientID: user_config.fb.client_id,
  clientSecret: user_config.fb.client_secret,
  callbackURL: get_fb_connect_callback_url(),
  profileFields: user_config.fb.profile_fields,
  passReqToCallback: true
}, function fb_connect_strategy_callback(req, token, token_secret, profile, done) {
  (make_passport_connect_strategy_callback({
    provider_find_fn: function(id) { return pr.pr.auth.user.find_with_fb_id(id, 'all'); },
    user_connect_fn: function(profile, token) { return req.user.connect_fb_and_save(profile, token); },
    connect_message: 'Facebook account connected',
    already_message: 'Facebook account already connected to another profile'
  }))(req, token, token_secret, profile, done);
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
  (make_passport_access_strategy_callback({
    user_find_fn: function(id) { return pr.pr.auth.user.find_with_google_id(id, 'all'); },
    user_create_fn: function(profile, token) { return pr.pr.auth.user.create_from_google_and_save(profile, token); },
    login_message: 'Logged in via Google'
  }))(req, token, refresh_token , profile, done);
}));

/**
 * passport.js Google reactivate strategy - react's user account if not active and logs them in, else just logs in
 */
passport.use('google-reactivate', new GoogleStrategy({
  clientID: user_config.google.client_id,
  clientSecret: user_config.google.client_secret,
  callbackURL: get_google_reactivate_callback_url(),
  passReqToCallback: true
}, function google_reactivate_strategy_callback(req, token, refresh_token, profile, done) {
  (make_passport_reactivate_strategy_callback({
    user_find_fn: function(id) { return pr.pr.auth.user.find_with_google_id(id, 'all'); },
    user_create_fn: function(profile, token) { return pr.pr.auth.user.create_from_google_and_save(profile, token); },
    react_message: 'Reactivated and logged in via Google',
    login_message: 'Logged in via Google'
  }))(req, token, refresh_token, profile, done);
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
  (make_passport_connect_strategy_callback({
    provider_find_fn: function(id) { return pr.pr.auth.user.find_with_google_id(id, 'all'); },
    user_connect_fn: function(profile, token) { return req.user.connect_google_and_save(profile, token); },
    connect_message: 'Google account connected',
    already_message: 'Google account already connected to another profile'
  }))(req, token, token_secret, profile, done);
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
  (make_passport_access_strategy_callback({
    user_find_fn: function(id) { return pr.pr.auth.user.find_with_twitter_id(id, 'all'); },
    user_create_fn: function(profile, token) { return pr.pr.auth.user.create_from_twitter_and_save(profile, token); },
    login_message: 'Logged in via Twitter'
  }))(req, token, token_secret, profile, done);
}));

/**
 * passport.js Twitter reactivate strategy - react's user account if not active and logs them in, else just logs in
 */
passport.use('twitter-reactivate', new TwitterStrategy({
  consumerKey: user_config.twitter.consumer_key,
  consumerSecret: user_config.twitter.consumer_secret,
  callbackURL: get_twitter_reactivate_callback_url(),
  passReqToCallback: true
}, function twitter_reactivate_strategy_callback(req, token, token_secret, profile, done) {
  (make_passport_reactivate_strategy_callback({
    user_find_fn: function(id) { return pr.pr.auth.user.find_with_twitter_id(id, 'all'); },
    user_create_fn: function(profile, token) { return pr.pr.auth.user.create_from_twitter_and_save(profile, token); },
    react_message: 'Reactivated and logged in via Twitter',
    login_message: 'Logged in via Twitter'
  }))(req, token, token_secret, profile, done);
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
  (make_passport_connect_strategy_callback({
    provider_find_fn: function(id) { return pr.pr.auth.user.find_with_twitter_id(id, 'all'); },
    user_connect_fn: function(profile, token) { return req.user.connect_twitter_and_save(profile, token); },
    connect_message: 'Twitter account connected',
    already_message: 'Twitter account already connected to another profile'
  }))(req, token, token_secret, profile, done);
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
    make_check_post_has_req_fields: function make_check_post_has_req_fields(required_fields) {
      return function check_post_has_req_fields(req, res, next) {
        _.each(required_fields, function(req_field) {
          if(req.body[req_field] === undefined) {
            logger.warn('exports.mw_gen.check_post_has_req_fields -- req. post variable undefined: ' + req_field);
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
