define(function(require) {
  'use strict';

  var q = require('q');

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/common/flash_message');

  AppObj.module('Common.Entities', function(Entities, AppObj, Backbone, Marionette, $, _) {
    require('js/common/base_entities');

    /**
     * Used to access a flash message stored on the server api_util_config.flash_message_key ('flash_message')
     */
    Entities.FlashMessage = AppObj.Common.Entities.ServerModel.extend({
      __name: 'FlashMessage',
      urlRoot: '/api/util/flash_message',

      /** sync override - only allow `read`, no `create`, `update` or `delete` */
      sync: function sync(method, model, options) {
        if(method === 'read') {
          return Backbone.Model.prototype.sync.call(this, method, model, options);
        }
        else {
          logger.error('Entities.UserProfile.sync - invalid method, sync not executed: ' + method);
        }
      },
    });

    var API = {
      /**
       * Returns a promise for the flash message possibly available at /api/util/flash_message
       */
      get_flash_message_promise: function get_flash_message_promise() {
        logger.trace('API.get_flash_message_promise -- enter');
        var deferred = q.defer();
        var flash_message = new Entities.FlashMessage();
        flash_message.fetch({
          success: function success(flash_message_model) {
            logger.debug('API.get_flash_message_promise - success -- received: ' + flash_message_model);
            deferred.resolve(flash_message_model);
          },
          error: function error() { deferred.resolve(undefined); }
        });
        return deferred.promise;
      }
    };

    AppObj.reqres.setHandler('common:entities:flashmessage', function() {
      return API.get_flash_message_promise();
    });
  });

  return AppObj.Common.Entities;
});
