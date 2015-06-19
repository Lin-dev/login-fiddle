define(function(require) {
  'use strict';

  var q = require('q');
  var validator = require('validator');

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/entities');

  /**
   * Member methods provide common validation functionality, each member method takes the value to be tested and
   * returns either a validation error string or undefined
   * @type {Object}
   */
  var val_checks = {
    /** Checks an email is correctly formatted */
    email: function email(email_string) {
      if(!validator.isEmail(email_string)) {
        return 'Invalid email address format';
      }
      else if(!validator.isLength(email_string, 3, 254)) { // ensure agrees with value in server/app/config/user.js
        return 'Maximum email address length is 254 characters';
      }
      else {
        return undefined;
      }
    },

    /** Checks a password field that is required / not optional */
    password: function password(password_string) {
      if(!validator.isLength(password_string, AppObj.config.apps.user.local_password_min_length)) {
        return 'Passwords must be at least 8 characters long';
      }
      else if(!validator.isLength(password_string, AppObj.config.apps.user.local_password_min_length,
        AppObj.config.apps.user.local_password_max_length)) {
        return 'Passwords maximum length is 256 characters'; // ensure agrees with value in server/app/config/user.js
      }
      else {
        return undefined;
      }
    }
  };

  AppObj.module('UserApp.Entities', function(Entities, AppObj, Backbone, Marionette, $, _) {
    require('js/common/base_entities');

    /**
     * Represents a local access form submission (email and possibly a password), They are client side only and used
     * because they are used for client-side validation only. There is no reqres handler because they're so simple
     * and should be referenced directly via the AppObj object.
     */
    Entities.UserLocalAccess = AppObj.Entities.ClientModel.extend({
      __name: 'UserLocalAccess',
      validate: function validate(attrs, options) {
        var errs = {};
        errs['local-email'] = val_checks.email(attrs.local_email);
        if(attrs.has_pw_flag === 'true') {
          errs['local-password'] = val_checks.password(attrs.local_password);
        }
        return _.pick(errs, _.identity); // remove undefined keys
      }
    });

    /**
     * Represents a local signup form submission (email, email_check, password, password_check). They are client side
     * only because they are used for client-side validation only. There is no reqres handler because they're so simple
     * and should be referenced directly via the AppObj object.
     */
    Entities.UserLocalSignup = AppObj.Entities.ClientModel.extend({
      __name: 'UserLocalSignup',
      validate: function validate(attrs, options) {
        var errs = {};
        errs['local-email'] = val_checks.email(attrs.local_email);
        errs['local-password'] = val_checks.password(attrs.local_password);
        if(errs['local-email'] === undefined && attrs.local_email !== attrs.local_email_check) {
          errs['email-check'] = 'Email addresses must match';
        }
        if(errs['local-password'] === undefined && attrs.local_password !== attrs.local_password_check) {
          errs['password-check'] = 'Passwords must match';
        }
        return _.pick(errs, _.identity); // remove undefined keys
      }
    });

    /**
     * Represents the information on a user profile - used for reading, updating and deleting the user profile but
     * not for creation
     */
    Entities.UserProfileData = AppObj.Entities.ServerModel.extend({
      __name: 'UserProfileData',
      urlRoot: '/api/user/user',
      sync: function sync(method, model, options) {
        if(method === 'read' || method === 'update' || method === 'delete') {
          return Backbone.Model.prototype.sync.call(this, method, model, options);
        }
        else {
          logger.error('Entities.UserProfile.sync - invalid method, sync not executed: ' + method);
        }
      },

      /**
       * Returns boolean true if this user profile is connected to their email address (and therefore has a password)
       */
      is_email_connected: function is_connected_to_email() {
        return this.get('local_email') ? true : false;
      },

      /**
       * Returns boolean true if this user profile is connected to facebook account
       */
      is_fb_connected: function is_connected_to_fb() {
        return this.get('fb_id') ? true : false;
      },

      /**
       * Returns boolean true if this user profile is connected to google account
       */
      is_google_connected: function is_connected_to_google() {
        return this.get('google_id') ? true : false;
      },

      /**
       * Returns boolean true if this user profile is connected to twitter account
       */
      is_twitter_connected: function is_connected_to_twitter() {
        return this.get('twitter_id') ? true : false;
      }
    });

    Entities.UserProfileAdmin = AppObj.Entities.ClientModel.extend({
      __name: 'UserProfileAdmin',
      defaults: {
        browser_logout_url: 'NYI',
        browser_connect_email_url: 'NYI',
        connect_email_url: 'NYI',
        connect_fb_url: AppObj.config.apps.user.fb_connect_url + '?display=' +
          'get_fb_google_display_mode_from_ui_scale(Marionette.get_ui_scale())',
        connect_google_url: AppObj.config.apps.user.google_connect_url + '?display=' +
          'get_fb_google_display_mode_from_ui_scale(Marionette.get_ui_scale())',
        connect_twitter_url: AppObj.config.apps.user.twitter_connect_url
      }
    });

    var API = {
      /**
       * Returns a promise for the currently logged in user
       */
      get_user_profile_data_promise: function get_user_profile_data_promise() {
        logger.trace('API.get_user_profile_data_promise -- enter');
        var deferred = q.defer();
        var user_profile = new Entities.UserProfileData();
        user_profile.fetch({
          success: function success(user_profile_model) { deferred.resolve(user_profile_model); },
          error: function error() { deferred.resolve(undefined); }
        });
        return deferred.promise;
      },

      /**
       * Returns a promise (immediately resolved) for the URL's used to admin a user account (logout, delete,
       * connect and disconnect to oauth provider)
       */
      get_user_profile_admin_promise: function get_user_profile_admin_promise() {
        logger.trace('API.get_user_profile_admin_promise -- enter');
        var deferred = q.defer();
        if(Entities.get_user_profile_admin === undefined) {
          Entities.get_user_profile_admin = new Entities.UserProfileAdmin();
        }
        deferred.resolve(Entities.get_user_profile_admin);
        return deferred.promise;
      }
    };

    AppObj.reqres.setHandler('userapp:entities:userprofiledata', function() {
      return API.get_user_profile_data_promise();
    });

    AppObj.reqres.setHandler('userapp:entities:userprofileadmin', function() {
      return API.get_user_profile_admin_promise();
    });
  });

  return AppObj.UserApp.Entities;
});
