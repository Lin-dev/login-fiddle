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



var local = {
  /**
   * Returns the facebook auth callback URL (assembled from server and user configs)
   */
  get_fb_auth_callback_url: function get_fb_auth_callback_url() {
    return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
      user_config.fb.auth_callback_path;
  },

  /**
   * Returns the facebook reactivate callback URL (assembled from server and user configs)
   */
  get_fb_reactivate_callback_url: function get_fb_reactivate_callback_url() {
    return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
      user_config.fb.reactivate_callback_path;
  },

  /**
   * Returns the facebook connect callback URL (assembled from server and user configs)
   */
  get_fb_connect_callback_url: function get_fb_connect_callback_url() {
    return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
      user_config.fb.connect_callback_path;
  },

  /**
   * Returns the google auth callback URL (assembled from server and user configs)
   */
  get_google_auth_callback_url: function get_google_auth_callback_url() {
    return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
      user_config.google.auth_callback_path;
  },

  /**
   * Returns the google reactivate callback URL (assembled from server and user configs)
   */
  get_google_reactivate_callback_url: function get_google_reactivate_callback_url() {
    return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
      user_config.google.reactivate_callback_path;
  },

  /**
   * Returns the google connect callback URL (assembled from server and user configs)
   */
  get_google_connect_callback_url: function get_google_connect_callback_url() {
    return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
      user_config.google.connect_callback_path;
  },

 /**
   * Returns the twitter auth callback URL (assembled from server and user configs)
   */
  get_twitter_auth_callback_url: function get_twitter_auth_callback_url() {
    return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
      user_config.twitter.auth_callback_path;
  },

  /**
   * Returns the twitter reactivate callback URL (assembled from server and user configs)
   */
  get_twitter_reactivate_callback_url: function get_twitter_reactivate_callback_url() {
    return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
      user_config.twitter.reactivate_callback_path;
  },

  /**
   * Returns the twitter connect callback URL (assembled from server and user configs)
   */
  get_twitter_connect_callback_url: function get_twitter_connect_callback_url() {
    return server_config.server_protocol + '://' + server_config.server_host + ':' + server_config.https_port +
      user_config.twitter.connect_callback_path;
  },

  /**
   * This function is for handling rejected promises in a passport strategy callback. It takes `done` as its first
   * argument and a req object as its second. The promise rejection error is the final argument. Intended usage in a
   * passport callback is:
   *     `promise.fail(local.handle_passport_callback_rejected_promise.bind(this, done, req));`
   *
   * @param  {Function} done A Passport callback's `done` function
   * @param  {[type]}   err  This is the rejected promise's error value
   * @return {[type]}        The `err` parameter
   */
  handle_passport_callback_rejected_promise: function handle_passport_callback_rejected_promise(done, req, err) {
    if(err && err.stack) {
      logger.error('local.handle_passport_callback_rejected_promise -- ' + err);
      logger.error(err.stack);
    }
    else {
      logger.error('local.handle_passport_callback_rejected_promise -- ' + err + ' (no stack)');
    }
    done(null, false, req.flash(api_util_config.flash_message_key, 'Server error'));
    return err;
  },

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
  make_passport_access_strategy_callback: function make_passport_access_strategy_callback(options) {
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
      /**
       * Logs a user in if they are active, or displays a reactivation flash message if they are inactive. The result
       * of calling the passport done callback (appropriately parameterised in each case) is returned. Has no async ops.
       *
       * @param  {Object} user The user object which results from a call to `options.user_find_fn`
       * @param  {Object} req  The request object passed to the callback by passport.js
       * @return {Object}      The result of calling the passport strategy's done function (may be undefined)
       */
      var login_user = function login_user(user, req) {
       if(user.is_active()) {
          logger.debug('login_user -- found existing user, logging in: ' + JSON.stringify(user));
          return done(null, user, req.flash(api_util_config.flash_message_key, options.login_message));
        }
        else {
          logger.debug('login_user -- deactivated login was successful: ' + JSON.stringify(user));
          return done(null, false, req.flash(api_util_config.flash_message_key,
            'Account currently deactivated, to reactivate click <a href="' + user_config.client_reactivate_path +
            '" class="js-action-link">here</a>'));
        }
      };

      /**
       * Creates a user using the profile and token passed to the passport_access_strategy_callback, returning a
       * promise chain for this creation and then calling done.
       *
       * @param  {Object}  profile The profile object passed to the callback by passport.js
       * @param  {String}  token   The token passed to the callback by passport.js
       * @param  {Object}  req     The request object passed to the callback by passport.js
       * @return {Promise}         The result of calling `option.user_create_fn` and then the strategy's done function
       */
      var create_user = function create_user(profile, token, req) {
        logger.debug('create_user -- user not found, creating from: ' + JSON.stringify(profile));
        return q(options.user_create_fn(profile, token))
          .then(function(user) {
            logger.info('create_user -- user created: ' + profile.id + ' / ' + profile.displayName);
            return done(null, user, req.flash(api_util_config.flash_message_key, 'Account created'));
          })
          .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
          // ^^ rejection could be DB or validation - don't distinguish these because val. is also done client side
      };

      /**
       * A promise handler for a login request from an external provider, to be called with the result of attempting
       * to find that user
       *
       * @param  {Object}  user A user object, as returned by a find function for a user
       * @return {Promise}      The result of calling `login_user` or `create_user`
       */
      var handle_login_request = function handle_login_request(user) {
        if(user !== null) { // user found - log in or offer to reactivate
          return q(user.reset_local_unsuccessful_logins())
            .then(login_user.bind(this, user, req));
        }
        else { // user not found - create account
          return create_user(profile, token, req);
        }
      };

      q(options.user_find_fn(profile.id))
      .then(handle_login_request)
      .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
    };
  },

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
   *
   * @param  {Object}   options An options object as described in the function summary above
   * @return {Function}         A function which can be executed as a passport.js strategy callback.
   */
  make_passport_reactivate_strategy_callback: function make_passport_reactivate_strategy_callback(options) {
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
    if(fatal_error) {
      throw new Error('make_passport_reactivate_strategy_callback -- fatal error, aborting - see logs');
    }

    return function passport_reactivate_strategy_callback(req, token, refresh_token, profile, done) {
      /**
       * Reactivates a user and logs them in. Calls reactivate_and_save on the `user` object then the passport.js `done`
       * function and returns the return value of this function call to the promise chain.
       *
       * @param  {Object} user The user object which results from a call to `options.user_find_fn`
       * @param  {Object} req  The request object passed to the callback by passport.js
       * @return {Promise}     Promise resolved with the return value of the strategy's done function (may be undefined)
       */
      var reactivate_user = function reactivate_user(user, req) {
        return q(user.reactivate_and_save())
          .then(user.reset_local_unsuccessful_logins.bind(user))
          .then(function(active_user) {
            logger.debug('reactivate_user -- reactivated user and logged in: ' + JSON.stringify(active_user));
            return done(null, active_user, req.flash(api_util_config.flash_message_key, options.react_message));
          })
          .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
      };

      /**
       * Creates a user using the profile and token passed to the passport_reactivate_strategy_callback, returning a
       * promise chain for this creation and then calling done.
       *
       * @param  {Object}  profile The profile object passed to the callback by passport.js
       * @param  {String}  token   The token passed to the callback by passport.js
       * @param  {Object}  req     The request object passed to the callback by passport.js
       * @return {Promise}         The result of calling `option.user_create_fn` and then the strategy's done function
       */
      var create_user = function create_user(profile, token, req) {
        logger.debug('create_user -- user not found, creating from: ' + JSON.stringify(profile));
        return q(options.user_create_fn(profile, token))
          .then(function(user) {
            var name = profile.name.givenName + ' / ' + profile.name.familyName;
            logger.info('create_user -- user created: ' + profile.id + ' / ' + name);
            return done(null, user, req.flash(api_util_config.flash_message_key, 'Account created'));
          })
          .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
      };

      /**
       * A promise handler for a reactivate request from an external provider, to be called with the result of
       * attempting to find that user
       *
       * @param  {Object}  user A user object, as returned by a find function for a user
       * @return {Promise}      A promise resolved with the result of calling `reactivate_user` or `create_user`
       */
      var handle_reactivate_request = function handle_reactivate_request(user) {
        if(user !== null) { // user found - reactivate
          return reactivate_user(user, req);
        }
        else { // user not found - create account
          return create_user(profile, token, req);
        }
      };

      q(options.user_find_fn(profile.id))
      .then(handle_reactivate_request)
      .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
    };
  },

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
  make_passport_connect_strategy_callback: function make_passport_connect_strategy_callback(options) {
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
      /**
       * Handles a request to connect this user account to another external authentication provider. Calls passport's
       * `done` callback but does not return anything.
       *
       * @param  {Object}  profile The profile object passed to the callback by passport.js
       * @param  {Object}  req     The request object passed to the callback by passport.js
       * @return {undefined} Nothing is returned from this function
       */
      var handle_connect_request = function handle_connect_request(profile, req) {
        q(options.provider_find_fn(profile.id))
        .then(function(user_from_provider) {
          if(user_from_provider === null) { // no account for this provicer id so update user account w/ provider info
            q(options.user_connect_fn(profile, token))
            .then(function(updated_user) {
              logger.debug('passport_connect_strategy_callback -- updated user, redirecting to profile');
              done(null, updated_user, req.flash(api_util_config.flash_message_key, options.connect_message));
            })
            .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
          }
          else { // there is already a LF account for this provider
            logger.warn('passport_connect_strategy_callback -- provider id ' + profile.id + ' already in use');
            done(null, req.user, req.flash(api_util_config.flash_message_key, options.already_message));
          }
        })
        .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
      };

      if(req.user) {
        handle_connect_request(profile, req);
      }
      else {
        logger.error('passport_connect_strategy_callback -- ' +
          'callback failed for provider id ' + profile.id + ' - no user on req');
        return done(null, undefined, req.flash(api_util_config.flash_message_key, 'Server error'));
      }
    };
  }
};



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
    done(err, undefined);
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
  var handle_signup_request = function handle_signup_request(user) {
    if(user === null) { // email not found, create the user
      var user_attrs = {};
      user_attrs[user_config.local.username_field] = email;
      user_attrs[user_config.local.password_field] = pr.pr.auth.user.hash_password(password);
      q(pr.pr.auth.user.create(user_attrs))
      .then(function(user) {
        logger.info('handle_signup_request -- created user with email: ' + email);
        return done(null, user, req.flash(api_util_config.flash_message_key, 'Account created'));
      })
      .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
      // ^^ rejection could be DB or validation - don't distinguish these because validation is also done client side
    }
    else {
      logger.warn('handle_signup_request -- account creation requested for existing account: ' + email);
      return done(null, false,
        req.flash(api_util_config.flash_message_key, 'An account with that email address already exists'));
    }
  };

  logger.trace('local_signup_strategy_callback -- enter');
  email = email.trim();
  q(pr.pr.auth.user.find_with_local_username(email, 'all'))
  .then(handle_signup_request)
  .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
}));

/**
 * passport.js local-login strategy
 */
passport.use('local-login', new LocalStrategy({
  usernameField: user_config.local.username_field,
  passwordField: user_config.local.password_field,
  passReqToCallback: true
}, function local_login_strategy_callback(req, email, password, done) {
  var handle_login_request = function handle_login_request(user) {
    if(user !== null) {
      return q(user.do_unsuccessful_login_wait())
        .then(function() {
          if(user.check_password_sync(password)) {
            q(user.reset_local_unsuccessful_logins())
            .then(function() {
              if(user.is_active()) {
                logger.debug('handle_login_request -- logged in: ' + email);
                return done(null, user, req.flash(api_util_config.flash_message_key, 'Logged in'));
              }
              else {
                logger.debug('handle_login_request -- deactivated login successful for: ' + email);
                return done(null, false, req.flash(api_util_config.flash_message_key, 'Account currently deactivated,' +
                  ' to reactivate click <a href="' + user_config.client_reactivate_path +
                  '" class="js-action-link">here</a>'));
              }
            })
            .fail(local.handle_passport_callback_rejected_promise.bind(this, done, req));
          }
          else {
            q(user.increment_local_unsuccessful_logins())
            .then(function() {
              logger.debug('handle_login_request -- incorrect password for: ' + email);
              return done(null, false, req.flash(api_util_config.flash_message_key, 'Incorrect password'));
            })
            .fail(local.handle_passport_callback_rejected_promise.bind(this, done, req));
          }
        })
        .fail(local.handle_passport_callback_rejected_promise.bind(this, done, req));
    }
    else {
      logger.debug('handle_login_request -- unknown email: ' + email);
      return done(null, false, req.flash(api_util_config.flash_message_key, 'No user with that email address found'));
    }
  };

  logger.trace('local_login_strategy_callback -- enter');
  email = email.trim();
  q(pr.pr.auth.user.find_with_local_username(email, 'all'))
  .then(handle_login_request)
  .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
}));

/**
 * passport.js local-reactivate strategy - reactivates user account if not active and logs them in, else just logs in
 */
passport.use('local-reactivate', new LocalStrategy({
  usernameField: user_config.local.username_field,
  passwordField: user_config.local.password_field,
  passReqToCallback: true
}, function local_reactivate_strategy_callback(req, email, password, done) {
  var handle_reactivation_request = function handle_reactivation_request(user) {
    if(user !== null) {
      return q(user.do_unsuccessful_login_wait())
        .then(function() {
          if(user.check_password_sync(password)) {
            q(user.reset_local_unsuccessful_logins())
            .then(user.reactivate_and_save())
            .then(function(active_user) {
              logger.debug('handle_reactivation_request -- reactivated user and logged in: ' + email);
              return done(null, active_user, req.flash(api_util_config.flash_message_key, 'Reactivated and logged in'));
            })
            .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
          }
          else {
            q(user.increment_local_unsuccessful_logins())
            .then(function() {
              logger.debug('handle_reactivation_request -- incorrect password: ' + email);
              return done(null, false, req.flash(api_util_config.flash_message_key, 'Incorrect password'));
            })
            .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
          }
        })
        .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
    }
    else {
      logger.debug('handle_reactivation_request -- unknown email: ' + email);
      return done(null, false, req.flash(api_util_config.flash_message_key, 'No user with that email address found'));
    }
  };

  logger.trace('local_reactivate_strategy_callback -- enter');
  email = email.trim();
  q(pr.pr.auth.user.find_with_local_username(email, 'all'))
  .then(handle_reactivation_request)
  .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
}));

/**
 * passport.js local-connect strategy
 */
passport.use('local-connect', new LocalStrategy({
  usernameField: user_config.local.username_field,
  passwordField: user_config.local.password_field,
  passReqToCallback: true
}, function local_connect_strategy_callback(req, email, password, done) {
  var handle_connect_request = function handle_connect_request(user_with_email) {
    if(user_with_email === null) { // that email address is not used - add it to logged in a/c along with the password
      var user_attrs = {};
      user_attrs[user_config.local.username_field] = email;
      user_attrs[user_config.local.password_field] = pr.pr.auth.user.hash_password(password);
      q(req.user.connect_local_and_save(user_attrs))
      .then(function(updated_user) {
        logger.debug('handle_connect_request -- email added to user: ' + JSON.stringify(updated_user));
        done(null, updated_user, req.flash(api_util_config.flash_message_key, 'Email address added'));
      })
      .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
    }
    else {
      logger.debug('handle_connect_request -- email already in use by user: ' + JSON.stringify(user_with_email));
      return done(null, false, req.flash(api_util_config.flash_message_key,
        'Email address already in use by another profile'));
    }
  };

  logger.trace('local_connect_strategy_callback -- enter');
  email = email.trim();
  q(pr.pr.auth.user.find_with_local_username(email, 'all'))
  .then(handle_connect_request)
  .fail(local.handle_passport_callback_rejected_promise.bind(null, done, req));
}));

/**
 * passport.js Facebook access strategy
 */
passport.use('fb-access', new FacebookStrategy({
  clientID: user_config.fb.client_id,
  clientSecret: user_config.fb.client_secret,
  callbackURL: local.get_fb_auth_callback_url(),
  profileFields: user_config.fb.profile_fields,
  passReqToCallback: true
}, function fb_access_strategy_callback(req, token, refresh_token, profile, done) {
  (local.make_passport_access_strategy_callback({
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
  callbackURL: local.get_fb_reactivate_callback_url(),
  profileFields: user_config.fb.profile_fields,
  passReqToCallback: true
}, function fb_reactivate_strategy_callback(req, token, refresh_token, profile, done) {
  (local.make_passport_reactivate_strategy_callback({
    user_find_fn: function(id) { return pr.pr.auth.user.find_with_fb_id(id, 'all'); },
    user_create_fn: function(profile, token) { return pr.pr.auth.user.create_from_fb_and_save(profile, token); },
    react_message: 'Reactivated and logged in via Facebook',
  }))(req, token, refresh_token, profile, done);
}));

/**
 * passport.js Facebook connect strategy
 */
passport.use('fb-connect', new FacebookStrategy({
  clientID: user_config.fb.client_id,
  clientSecret: user_config.fb.client_secret,
  callbackURL: local.get_fb_connect_callback_url(),
  profileFields: user_config.fb.profile_fields,
  passReqToCallback: true
}, function fb_connect_strategy_callback(req, token, token_secret, profile, done) {
  (local.make_passport_connect_strategy_callback({
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
  callbackURL: local.get_google_auth_callback_url(),
  passReqToCallback: true
}, function google_access_strategy_callback(req, token, refresh_token, profile, done) {
  (local.make_passport_access_strategy_callback({
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
  callbackURL: local.get_google_reactivate_callback_url(),
  passReqToCallback: true
}, function google_reactivate_strategy_callback(req, token, refresh_token, profile, done) {
  (local.make_passport_reactivate_strategy_callback({
    user_find_fn: function(id) { return pr.pr.auth.user.find_with_google_id(id, 'all'); },
    user_create_fn: function(profile, token) { return pr.pr.auth.user.create_from_google_and_save(profile, token); },
    react_message: 'Reactivated and logged in via Google',
  }))(req, token, refresh_token, profile, done);
}));

/**
 * passport.js Google connect strategy
 */
passport.use('google-connect', new GoogleStrategy({
  clientID: user_config.google.client_id,
  clientSecret: user_config.google.client_secret,
  callbackURL: local.get_google_connect_callback_url(),
  passReqToCallback: true
}, function google_connect_strategy_callback(req, token, token_secret, profile, done) {
  (local.make_passport_connect_strategy_callback({
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
  callbackURL: local.get_twitter_auth_callback_url(),
  passReqToCallback: true
}, function twitter_access_strategy_callback(req, token, token_secret, profile, done) {
  (local.make_passport_access_strategy_callback({
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
  callbackURL: local.get_twitter_reactivate_callback_url(),
  passReqToCallback: true
}, function twitter_reactivate_strategy_callback(req, token, token_secret, profile, done) {
  (local.make_passport_reactivate_strategy_callback({
    user_find_fn: function(id) { return pr.pr.auth.user.find_with_twitter_id(id, 'all'); },
    user_create_fn: function(profile, token) { return pr.pr.auth.user.create_from_twitter_and_save(profile, token); },
    react_message: 'Reactivated and logged in via Twitter',
  }))(req, token, token_secret, profile, done);
}));

/**
 * passport.js Twitter connect strategy
 */
passport.use('twitter-connect', new TwitterStrategy({
  consumerKey: user_config.twitter.consumer_key,
  consumerSecret: user_config.twitter.consumer_secret,
  callbackURL: local.get_twitter_connect_callback_url(),
  passReqToCallback: true
}, function twitter_connect_strategy_callback(req, token, token_secret, profile, done) {
  (local.make_passport_connect_strategy_callback({
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
