define(function(require) {
  'use strict';

  var q = require('q');

  var AppObj = require('js/app/obj');
  var Display = require('js/display/obj');
  var logger = AppObj.logger.get('root/js/apps/entry/list/controller');
  logger.trace('require:lambda -- enter');

  AppObj.module('EntryApp.List', function(List, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    List.controller = {
      show_list: function show_list(tag_string) {
        logger.trace('show_list -- enter - ' + tag_string);
        require('js/apps/entry/entities');
        var tags_promise = AppObj.request('entryapp:entities:tags');
        var entries_promise = AppObj.request('entryapp:entities:entries', tag_string);
        q.all([tags_promise, entries_promise])
        .spread(function(tags, entries) {
          var Views = require('js/apps/entry/list/views');
          var view = new Views.ListLayout();

          var tags_view = new Views.Tags({ collection: tags });
          tags_view.on('childview:navigate', function(args) {
            logger.trace('event - tags_view:childview:navigate -- enter w/ ' + args.model.get('value'));
            AppObj.trigger('entry:list', args.model.get('value'));
          });

          var FWC = require('js/common/filtering_wrapper_collection').FilteringWrapperCollection;
          var filterable_entries = FWC({
            collection: entries,
            make_filter_predicate: function make_filter_predicate() {
              return function filter_predicate_tags(entry) {
                return _.any(entry.get('tags'), function(tag) { return tag.value === tag_string; });
              };
            }
          });
          filterable_entries.filter(tag_string);

          var entries_view = new Views.Entries({ collection: filterable_entries });

          view.on('show', function() {
            view.tags_region.show(tags_view);
            view.entries_region.show(entries_view);
          });

          Display.tainer.show_in('main', view);
        })
        .fail(AppObj.handle_rejected_promise.bind(undefined, 'EntryApp.List.controller.show_list'))
        .done();
        logger.trace('show_list -- exit');
      }
    };
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.EntryApp.List.controller;
});
