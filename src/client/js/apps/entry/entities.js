define(function(require) {
  'use strict';

  var q = require('q');
  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/entry/entities');

  AppObj.module('EntryApp.Entities', function(Entities, AppObj, Backbone, Marionette, $, _) {
    require('js/common/base_entities');

    Entities.Entry = AppObj.Entities.AppObjDatabaseModel.extend({
      __name: 'Entry',
      urlRoot: '/api/entry/entry'
    });

    Entities.EntryCollection = AppObj.Entities.AppObjDatabaseCollection.extend({
      __name: 'EntryCollection',
      url: '/api/entry/entry',
      model: Entities.Entry
    });

    Entities.Tag = AppObj.Entities.AppObjDatabaseModel.extend({
      __name: 'Tag',
      urlRoot: '/api/entry/tag',
      initialize: function() {
        _.extend(this, new Backbone.Picky.Selectable(this));
      }
    });

    Entities.TagCollection = AppObj.Entities.AppObjDatabaseCollection.extend({
      __name: 'TagCollection',
      url: '/api/entry/tag',
      model: Entities.Tag,

      initialize: function() {
        _.extend(this, new Backbone.Picky.SingleSelect(this));
      }
    });

    var API = {
      // TODO: Use tag_string to filter returned entries when fetching from DB
      get_entries_promise: function(tag_string) {
        logger.trace('API.get_entries_promise -- enter');
        var deferred = q.defer();
        var entry_collection = new Entities.EntryCollection();
        entry_collection.fetch({
          success: function(entry_collection) { deferred.resolve(entry_collection); },
          error: function() { deferred.resolve(undefined); }
        });
        return deferred.promise;
      },

      get_tags_promise: function() {
        logger.trace('API.get_tags_promise -- enter');
        var deferred = q.defer();
        var tag_collection = new Entities.TagCollection();
        tag_collection.fetch({
          success: function(tag_collection) { deferred.resolve(tag_collection); },
          error: function() { deferred.resolve(undefined); }
        });
        return deferred.promise;
      }
    };

    AppObj.reqres.setHandler('entryapp:entities:entries', function(tag_string) {
      return API.get_entries_promise(tag_string);
    });

    AppObj.reqres.setHandler('entryapp:entities:tags', function() {
      return API.get_tags_promise();
    });
  });

  return undefined;
});
