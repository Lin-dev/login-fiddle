define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/common/base_entities');
  logger.trace('require:lambda -- enter');

  AppObj.module('Entities', function(Entities, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    require('js/common/backbone_extensions');

    Entities.AppObjDatabaseModel = Backbone.Model.extend({ __name: 'AppObjDatabaseModel' });
    Entities.AppObjDatabaseCollection = Backbone.Collection.extend({ __name: 'AppObjDatabaseCollection' });

    // Base class for model which represent client-only data, i.e. not directly fetched or saved to server
    Entities.AppObjClientOnlyModel = Backbone.Model.extend({ __name: 'AppObjClientOnlyModel' });
    Entities.AppObjClientOnlyModel.prototype.sync = function() {
      logger.warn('Entities.AppObjClientOnlyModel.sync called, method does nothing and returns null');
      return null;
    };
    Entities.AppObjClientOnlyModel.prototype.fetch = function() {
      logger.warn('Entities.AppObjClientOnlyModel.fetch called, method does nothing and returns null');
      return null;
    };
    Entities.AppObjClientOnlyModel.prototype.save = function() {
      logger.warn('Entities.AppObjClientOnlyModel.save called, method does nothing and returns null');
      return null;
    };

    // Base class for collections which represent client-only data, i.e. not directly fetched or saved to server
    Entities.AppObjClientOnlyCollection = Backbone.Collection.extend({ __name: 'AppObjClientOnlyCollection' });
    Entities.AppObjClientOnlyCollection.prototype.sync = function() {
      logger.warn('Entities.AppObjClientOnlyCollection.sync called, method does nothing and returns null');
      return null;
    };
    Entities.AppObjClientOnlyCollection.prototype.fetch = function() {
      logger.warn('Entities.AppObjClientOnlyCollection.fetch called, method does nothing and returns null');
      return null;
    };
    Entities.AppObjClientOnlyCollection.prototype.save = function() {
      logger.warn('Entities.AppObjClientOnlyCollection.save called, method does nothing and returns null');
      return null;
    };
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return undefined;
});
