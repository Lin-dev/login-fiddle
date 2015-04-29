define(function(require) {
  'use strict';

  var q = require('q');
  var validator = require('validator');

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/entities');

  PF.module('UserApp.Entities', function(Entities, PF, Backbone, Marionette, $, _) {
    require('js/common/base_entities');

    Entities.UserLocalSignup = PF.Entities.PFDatabaseModel.extend({
      __name: 'UserLocalSignup',
      urlRoot: '/api/user/user',
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

    var API = {
      get_promise: function(user_id) {
        logger.trace('API.get_promise -- enter');
        var deferred = q.defer();
        var user = new Entities.User({ id: user_id });
        user.fetch({
          success: function(user_model) { deferred.resolve(user_model); },
          error: function() { deferred.resolve(undefined); }
        });
        return deferred.promise;
      }
    };

    PF.reqres.setHandler('userapp:entities:user', function() {
      return API.get_promise();
    });
  });

  return PF.UserApp.Entities;
});
