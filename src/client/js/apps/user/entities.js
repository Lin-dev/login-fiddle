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
    require('js/base/entities');

    /**
     * Represents a local access form submission (email and possibly a password), They are client side only and used
     * for validating form inputs client-side. There is no reqres handler because they're so simple and should be
     * referenced directly via the AppObj object.
     */
    Entities.UserLocalAccess = AppObj.Base.Entities.TransientModel.extend({
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
     * Represents a local access form submission for reactivation (email and password), They are client side only and
     * used for validating form inputs client-side. There is no reqres handler because they're so simple and should be
     * referenced directly via the AppObj object.
     */
    Entities.UserLocalReactivate = AppObj.Base.Entities.TransientModel.extend({
      __name: 'UserLocalReactivate',
      validate: function validate(attrs, options) {
        var errs = {};
        errs['local-email'] = val_checks.email(attrs.local_email);
        errs['local-password'] = val_checks.password(attrs.local_password);
        return _.pick(errs, _.identity); // remove undefined keys
      }
    });

    /**
     * Represents a local signup or connect form submission (email, email_check, password, password_check). This entity
     * is client side only because they are used for client-side validation only. There is no reqres handler because
     * they're so simple and should be referenced directly via the AppObj object.
     */
    Entities.LocalDataForValidation = AppObj.Base.Entities.TransientModel.extend({
      __name: 'LocalDataForValidation',
      validate: function validate(attrs, options) {
        var errs = {};
        errs['email-check'] = val_checks.email(attrs.local_email);
        errs['password-check'] = val_checks.password(attrs.local_password);
        if(errs['email-check'] === undefined && attrs.local_email !== attrs.local_email_check) {
          errs['email-check'] = 'Email addresses must match';
        }
        if(errs['password-check'] === undefined && attrs.local_password !== attrs.local_password_check) {
          errs['password-check'] = 'Passwords must match';
        }
        return _.pick(errs, _.identity); // remove undefined keys
      }
    });

    /**
     * Represents a local signup form submission (email, email_check, password, password_check). They are client side
     * only because they are used for client-side validation only. There is no reqres handler because they're so simple
     * and should be referenced directly via the AppObj object. To avoid validation code dupe, Entities.LocalConnect
     * and Entities.UserLocalSignup both use the same 'super class', Entities.LocalDataForValidation. In future if
     * requirements diverge child classes can implement their specific requirements
     */
    Entities.UserLocalSignup = Entities.LocalDataForValidation.extend({
      __name: 'UserLocalSignup'
    });

    /**
     * Represents a local connect form submission (email, email_check, password, password_check). To avoid validation
     * code dupe Entities.UserLocalConnect and Entities.UserLocalSignup both use the same 'super class',
     * Entities.LocalDataForValidation. In future if requirements diverge child classes can implement their specific
     * requirements
     */
    Entities.UserLocalConnect = Entities.LocalDataForValidation.extend({
      __name: 'LocalConnect'
    });

    Entities.UserChangePassword = AppObj.Base.Entities.TransientModel.extend({
      __name: 'UserChangePassword',
      validate: function validate(attrs, options) {
        var errs = {};
        errs['old-password'] = val_checks.password(attrs.old_password);
        errs['new-password-check'] = val_checks.password(attrs.new_password_check);
        if(errs['new-password-check'] === undefined && attrs.new_password !== attrs.new_password_check) {
          errs['new-password-check'] = 'Passwords must match';
        }
        if(errs['new-password-check'] === undefined && attrs.old_password === attrs.new_password) {
          errs['new-password-check'] = 'New password must be different';
        }
        return _.pick(errs, _.identity); // remove undefined keys
      }
    });

    /**
     * Represents the information on a user profile - used for reading, updating and deleting the user profile but
     * not for creation
     */
    Entities.UserProfileData = AppObj.Base.Entities.PersistentModel.extend({
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

    /**
     * Stores the client (browser accessible) URL's used in the profile control panel
     */
    Entities.UserProfileControlPanel = AppObj.Base.Entities.TransientModel.extend({
      __name: 'UserProfileControlPanel',
      defaults: {
        client_conn_local_path: '/profile/connect/local',
        client_conn_fb_path: '/profile/connect/facebook',
        client_conn_google_path: '/profile/connect/google',
        client_conn_twitter_path: '/profile/connect/twitter',
        client_disc_local_path: '/profile/disconnect/local',
        client_disc_fb_path: '/profile/disconnect/facebook',
        client_disc_google_path: '/profile/disconnect/google',
        client_disc_twitter_path: '/profile/disconnect/twitter',
        client_logout_path: '/profile/logout',
        client_deactivate_path: '/profile/deactivate',
        client_change_password_path: '/profile/change/password'
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
          Entities.get_user_profile_admin = new Entities.UserProfileControlPanel();
        }
        deferred.resolve(Entities.get_user_profile_admin);
        return deferred.promise;
      }
    };

    AppObj.reqres.setHandler('userapp:entities:userprofiledata', function() {
      return API.get_user_profile_data_promise();
    });

    AppObj.reqres.setHandler('userapp:entities:userprofilecontrolpanel', function() {
      return API.get_user_profile_admin_promise();
    });
  });

  return AppObj.UserApp.Entities;
});
