define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/entry/list/view');
  logger.trace('require:lambda -- enter');

  AppObj.module('EntryApp.List.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    require('js/common/views');

    Views.Tag = AppObj.Base.Views.AppObjItemView.extend({
      __name: 'Tag',
      template: _.template(require('text!js/apps/entry/list/templates/tag.html')),
      tagName: 'li',

      triggers: {
        'click a.js-tag': 'navigate'
      }
    });

    Views.Tags = AppObj.Base.Views.AppObjCompositeView.extend({
      __name: 'Tags',
      template: _.template(require('text!js/apps/entry/list/templates/tags.html')),
      childView: Views.Tag,
      childViewContainer: 'ul.js-tag-items'
    });

    Views.Entry = AppObj.Base.Views.AppObjItemView.extend({
      __name: 'Entry',
      template: _.template(require('text!js/apps/entry/list/templates/entry.html')),
      tagName: 'li',

      triggers: {
        'click a.js-tag': 'navigate'
      }
    });

    Views.Entries = AppObj.Base.Views.AppObjCompositeView.extend({
      __name: 'Entries',
      template: _.template(require('text!js/apps/entry/list/templates/entries.html')),
      childView: Views.Entry,
      childViewContainer: 'ul.js-entry-items'
    });

    Views.ListLayout = AppObj.Base.Views.AppObjLayout.extend({
      __name: 'ListLayout',
      template: _.template(require('text!js/apps/entry/list/templates/list_layout.html')),
      regions: {
        tags_region: '#tags_region',
        entries_region: '#entries_region'
      }
    });

    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.EntryApp.List.Views;
});
