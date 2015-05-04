define(function(require) {
  'use strict';

  var q = require('q');
  var validator = require('validator');

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/entities');

  PF.module('UserApp.Entities', function(Entities, PF, Backbone, Marionette, $, _) {
    require('js/common/base_entities');

    /**
     * Represents a local access form submission (email and password), post/create is the only verb allowed. There is
     * no reqres handler for entities of this type because they're so simple and transitory - just reference them via
     * the PF object and create them directly in the controller's
     */
    Entities.UserLocalAccess = PF.Entities.PFClientOnlyModel.extend({
      __name: 'UserLocalAccess',

      validate: function(attrs, options) {
        var errors = {};
        if(!validator.isEmail(attrs.email)) {
          errors['email'] = '"' + attrs.email + '" - invalid email address format';
        }

        if(attrs.password && !validator.isAlphanumeric(attrs.password)) {
          errors['password'] = 'Passwords must be letters and numbers only (and at least 8 characters long)';
        }
        else if(attrs.password && !validator.isLength(attrs.password, 8)) {
          errors['password'] = 'Passwords must be at least 8 characters long (letters and numbers only)';
        }

        return errors;
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
