define(function(require) {
  'use strict';

  var q = require('q');
  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/entry/entities');

  AppObj.module('EntryApp.Entities', function(Entities, AppObj, Backbone, Marionette, $, _) {
    require('js/base/entities');

    Entities.Entry = AppObj.Base.Entities.PersistentModel.extend({
      __name: 'Entry',
      urlRoot: '/api/entry/entry'
    });

    Entities.EntryCollection = AppObj.Base.Entities.PersistentCollection.extend({
      __name: 'EntryCollection',
      url: '/api/entry/entry',
      model: Entities.Entry
    });

    Entities.Tag = AppObj.Base.Entities.PersistentModel.extend({
      __name: 'Tag',
      urlRoot: '/api/entry/tag',
      initialize: function initialize() {
        _.extend(this, new Backbone.Picky.Selectable(this));
      }
    });

    Entities.TagCollection = AppObj.Base.Entities.PersistentCollection.extend({
      __name: 'TagCollection',
      url: '/api/entry/tag',
      model: Entities.Tag,

      initialize: function initialize() {
        _.extend(this, new Backbone.Picky.SingleSelect(this));
      }
    });

    var API = {
      // TODO: Use tag_string to filter returned entries when fetching from DB
      get_entries_promise: function get_entries_promise(tag_string) {
        logger.trace('API.get_entries_promise -- enter');
        var deferred = q.defer();
        var entry_collection = new Entities.EntryCollection();
        entry_collection.fetch({
          success: function success(entry_collection) { deferred.resolve(entry_collection); },
          error: function error() { deferred.resolve(undefined); }
        });
        return deferred.promise;
      },

      get_tags_promise: function get_tags_promise() {
        logger.trace('API.get_tags_promise -- enter');
        var deferred = q.defer();
        var tag_collection = new Entities.TagCollection();
        tag_collection.fetch({
          success: function success(tag_collection) { deferred.resolve(tag_collection); },
          error: function error() { deferred.resolve(undefined); }
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

  return AppObj.EntryApp.Entities;
});
