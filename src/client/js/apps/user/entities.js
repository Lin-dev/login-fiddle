define(function(require) {
  'use strict';

  var q = require('q');
  var validator = require('validator');

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/entities');

  /**
   * Member methods provide common validation functionality, each member method takes the value to be tested and
   * returns either a validation error string or undefined
   * @type {Object}
   */
  var val_checks = {
    email: function(email_string) {
      return validator.isEmail(email_string) ? undefined : 'Invalid email address format';
    },
    password: function(password_string) {
      if(password_string === undefined) { return undefined; }
      else if(!validator.isAlphanumeric(password_string)) {
        return 'Passwords must be letters and numbers only (and at least 8 characters long)';
      }
      else if(!validator.isLength(password_string, 8)) {
        return 'Passwords must be at least 8 characters long (letters and numbers only)';
      }
      else { return undefined; }
    }
  };

  PF.module('UserApp.Entities', function(Entities, PF, Backbone, Marionette, $, _) {
    require('js/common/base_entities');

    /**
     * Represents a local access form submission (email and possibly a password), They are client side only and used
     * because they are used for client-side validation only. There is no reqres handler because they're so simple
     * and should be referenced directly via the PF object.
     */
    Entities.UserLocalAccess = PF.Entities.PFClientOnlyModel.extend({
      __name: 'UserLocalAccess',

      validate: function(attrs, options) {
        var errors = {};
        errors['email'] = val_checks.email(attrs.email);
        errors['password'] = val_checks.password(attrs.password);
        return _.pick(errors, _.identity); // remove undefined keys
      }
    });

    /**
     * Represents a local signup form submission (email, email_check, password, password_check). They are client side
     * only because they are used for client-side validation only. There is no reqres handler because they're so simple
     * and should be referenced directly via the PF object.
     */
    Entities.UserLocalSignup = PF.Entities.PFClientOnlyModel.extend({
      __name: 'UserLocalSignup',

      validate: function(attrs, options) {
        var errors = {};
        errors['email'] = val_checks.email(attrs.email);
        errors['password'] = val_checks.email(attrs.password);
        if(errors['email'] === undefined && attrs.email !== attrs.email_check) {
          errors['email_check'] = 'Email addresses must match';
        }
        if(errors['password'] === undefined && attrs.password !== attrs.password_check) {
          errors['password_check'] = 'Passwords must match';
        }
      }
    });

    /**
     * Represents the information on a user profile - used for reading, updating and deleting the user profile but
     * not for creation
     */
    Entities.UserProfile = PF.Entities.PFDatabaseModel.extend({
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

    PF.reqres.setHandler('userapp:entities:userprofile', function() {
      return API.get_user_profile_promise();
    });
  });

  return PF.UserApp.Entities;
});
