define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/common/views');
  logger.trace('require:lambda -- enter');

  AppObj.module('Common.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    Views.AppObjItemView = Marionette.ItemView.extend({ __name: 'AppObjItemView' });
    Views.AppObjCollectionView = Marionette.CollectionView.extend({ __name: 'AppObjCollectionView' });
    Views.AppObjCompositeView = Marionette.CompositeView.extend({ __name: 'AppObjCompositeView' });
    Views.AppObjLayout = Marionette.LayoutView.extend({ __name: 'AppObjLayout' });
    Views.AppObjRegion = Marionette.Region.extend({ __name: 'AppObjRegion' });
    logger.trace('AppObj.module -- exit');
  });
  logger.trace('require:lambda -- exit');
  return AppObj.Common.Views;
});
