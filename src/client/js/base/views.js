define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/base/entities');
  logger.trace('require:lambda -- enter');

  AppObj.module('Base.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    Views.AppObjItemView = Marionette.ItemView.extend({ __name: 'AppObjItemView' });
    Views.AppObjCollectionView = Marionette.CollectionView.extend({ __name: 'AppObjCollectionView' });
    Views.AppObjCompositeView = Marionette.CompositeView.extend({ __name: 'AppObjCompositeView' });
    Views.AppObjLayout = Marionette.LayoutView.extend({ __name: 'AppObjLayout' });
    Views.AppObjRegion = Marionette.Region.extend({ __name: 'AppObjRegion' });
  });

  return AppObj.Base.Views;
});
