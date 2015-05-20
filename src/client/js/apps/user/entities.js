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
    email: function(email_string) {
      return validator.isEmail(email_string) ? undefined : 'Invalid email address format';
    },

    /** Checks a password field that is required / not optional */
    password: function(password_string) {
      if(!validator.isLength(password_string, 8)) {
        return 'Passwords must be at least 8 characters long';
      }
      else if(!validator.isLength(password_string, 8, 256)) {
        return 'Passwords maximum length is 256 characters';
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

      validate: function(attrs, options) {
        var errors = {};
        errors['local-email'] = val_checks.email(attrs.local_email);
        if(attrs.has_pw_flag === 'true') {
          errors['local-password'] = val_checks.password(attrs.local_password);
        }
        return _.pick(errors, _.identity); // remove undefined keys
      }
    });

    /**
     * Represents a local signup form submission (email, email_check, password, password_check). They are client side
     * only because they are used for client-side validation only. There is no reqres handler because they're so simple
     * and should be referenced directly via the AppObj object.
     */
    Entities.UserLocalSignup = AppObj.Entities.ClientModel.extend({
      __name: 'UserLocalSignup',

      validate: function(attrs, options) {
        var errors = {};
        errors['local-email'] = val_checks.email(attrs.local_email);
        errors['local-password'] = val_checks.password(attrs.local_password);
        if(errors['local-email'] === undefined && attrs.local_email !== attrs.local_email_check) {
          errors['email-check'] = 'Email addresses must match';
        }
        if(errors['local-password'] === undefined && attrs.local_password !== attrs.local_password_check) {
          errors['password-check'] = 'Passwords must match';
        }
        return _.pick(errors, _.identity); // remove undefined keys
      }
    });

    /**
     * Represents the information on a user profile - used for reading, updating and deleting the user profile but
     * not for creation
     */
    Entities.UserProfile = AppObj.Entities.ServerModel.extend({
      __name: 'UserProfile',
      urlRoot: '/api/user/user',
      sync: function(method, model, options) {
        if(method === 'read' || method === 'update' || method === 'delete') {
          return Backbone.Model.prototype.sync.call(this, method, model, options);
        }
        else {
          logger.error('Entities.UserProfile.sync - invalid method, sync not executed: ' + method);
        }
      }
    });

    var API = {
      get_user_profile_promise: function(user_id) {
        logger.trace('API.get_promise -- enter');
        var deferred = q.defer();
        var user_profile = new Entities.UserProfile();
        user_profile.fetch({
          success: function(user_profile_model) { deferred.resolve(user_profile_model); },
          error: function() { deferred.resolve(undefined); }
        });
        return deferred.promise;
      }
    };

    AppObj.reqres.setHandler('userapp:entities:userprofile', function() {
      return API.get_user_profile_promise();
    });
  });

  return AppObj.UserApp.Entities;
});
