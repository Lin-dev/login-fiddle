define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/base/entities');
  logger.trace('require:lambda -- enter');

  AppObj.module('Base.Entities', function(Entities, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    Entities.PersistentModel = Backbone.Model.extend({ __name: 'PersistentModel' });
    Entities.PersistentCollection = Backbone.Collection.extend({ __name: 'PersistentCollection' });

    /**
     * Base class for model which represents persisted data that is not created, deleted or updating using Backbone's
     * sync (i.e. it is read-only as far as Backbone is concerned)
     */
    Entities.ROnlyPersistentModel = Entities.PersistentModel.extend({ __name: 'ROnlyPersistentModel' });
    Entities.ROnlyPersistentModel.prototype.sync = function sync(method, model, options) {
      if(method === 'read') {
        return Backbone.Model.prototype.sync.call(this, method, model, options);
      }
      else {
        logger.error('Entities.UserProfile.sync - invalid method, sync not executed: ' + method);
      }
    };

    /**
     * Base class for collection which represents persisted data that is not created, deleted or updating using
     * Backbone's sync (i.e. it is read-only as far as Backbone is concerned)
     */
    Entities.ROnlyPersistentCollection = Entities.PersistentCollection.extend({ __name: 'ROnlyPersistentCollection' });
    Entities.ROnlyPersistentCollection.prototype.sync = function sync(method, model, options) {
      if(method === 'read') {
        return Backbone.Model.prototype.sync.call(this, method, model, options);
      }
      else {
        logger.error('Entities.UserProfile.sync - invalid method, sync not executed: ' + method);
      }
    };

    /**
     * Base class for model which represent client-only data, i.e. not directly fetched or saved to server
     */
    Entities.TransientModel = Backbone.Model.extend({ __name: 'TransientModel' });
    Entities.TransientModel.prototype.sync = function sync() {
      logger.warn('Entities.TransientModel.sync called, method does nothing and returns null');
      return null;
    };
    Entities.TransientModel.prototype.fetch = function fetch() {
      logger.warn('Entities.TransientModel.fetch called, method does nothing and returns null');
      return null;
    };
    Entities.TransientModel.prototype.save = function save() {
      logger.warn('Entities.TransientModel.save called, method does nothing and returns null');
      return null;
    };

    /**
     * Base class for collections which represent client-only data, i.e. not directly fetched or saved to server
     */
    Entities.TransientCollection = Backbone.Collection.extend({ __name: 'TransientCollection' });
    Entities.TransientCollection.prototype.sync = function sync() {
      logger.warn('Entities.TransientCollection.sync called, method does nothing and returns null');
      return null;
    };
    Entities.TransientCollection.prototype.fetch = function fetch() {
      logger.warn('Entities.TransientCollection.fetch called, method does nothing and returns null');
      return null;
    };
    Entities.TransientCollection.prototype.save = function save() {
      logger.warn('Entities.TransientCollection.save called, method does nothing and returns null');
      return null;
    };
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.Base.Entities;
});
