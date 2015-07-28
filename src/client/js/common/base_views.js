define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/common/base_entities');
  logger.trace('require:lambda -- enter');

  AppObj.module('Common.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    require('js/common/backbone_extensions');

    Views.AppObjItemView = Marionette.ItemView.extend({ __name: 'AppObjItemView' });
    Views.AppObjCollectionView = Marionette.CollectionView.extend({ __name: 'AppObjCollectionView' });
    Views.AppObjCompositeView = Marionette.CompositeView.extend({ __name: 'AppObjCompositeView' });
    Views.AppObjLayout = Marionette.LayoutView.extend({ __name: 'AppObjLayout' });
    Views.AppObjRegion = Marionette.Region.extend({ __name: 'AppObjRegion' });
  });

  return AppObj.Common.Views;
});
