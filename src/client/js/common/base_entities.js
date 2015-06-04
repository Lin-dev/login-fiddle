define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/common/base_entities');
  logger.trace('require:lambda -- enter');

  AppObj.module('Entities', function(Entities, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    require('js/common/backbone_extensions');

    Entities.ServerModel = Backbone.Model.extend({ __name: 'ServerModel' });
    Entities.AppObjDatabaseCollection = Backbone.Collection.extend({ __name: 'AppObjDatabaseCollection' });

    // Base class for model which represent client-only data, i.e. not directly fetched or saved to server
    Entities.ClientModel = Backbone.Model.extend({ __name: 'ClientModel' });
    Entities.ClientModel.prototype.sync = function sync() {
      logger.warn('Entities.ClientModel.sync called, method does nothing and returns null');
      return null;
    };
    Entities.ClientModel.prototype.fetch = function fetch() {
      logger.warn('Entities.ClientModel.fetch called, method does nothing and returns null');
      return null;
    };
    Entities.ClientModel.prototype.save = function save() {
      logger.warn('Entities.ClientModel.save called, method does nothing and returns null');
      return null;
    };

    // Base class for collections which represent client-only data, i.e. not directly fetched or saved to server
    Entities.AppObjClientOnlyCollection = Backbone.Collection.extend({ __name: 'AppObjClientOnlyCollection' });
    Entities.AppObjClientOnlyCollection.prototype.sync = function sync() {
      logger.warn('Entities.AppObjClientOnlyCollection.sync called, method does nothing and returns null');
      return null;
    };
    Entities.AppObjClientOnlyCollection.prototype.fetch = function fetch() {
      logger.warn('Entities.AppObjClientOnlyCollection.fetch called, method does nothing and returns null');
      return null;
    };
    Entities.AppObjClientOnlyCollection.prototype.save = function save() {
      logger.warn('Entities.AppObjClientOnlyCollection.save called, method does nothing and returns null');
      return null;
    };
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.Entities;
});
