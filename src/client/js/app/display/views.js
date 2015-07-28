define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/app/display/views');

  AppObj.module('Display.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    require('js/common/base_views');

    /**
     * The wrapper layout for displaying the application layouts in
     * @type {Object}
     */
    Views.AppLayoutContainer = AppObj.Common.Views.AppObjLayout.extend({
      template: _.template(require('text!js/app/display/templates/app_layout_container.html')),
      regions: {
        'app': 'div#app'
      },

      /**
       * Show a view in the application layout region currently displayed in the container's main view slot `app`
       * @param  {String} region_name The application layout region name to display in
       * @param  {Object} view        The view to be displayed in the application layout region
       */
      show_in: function show_in(region_name, view) {
        if(this.app.currentView[region_name]) {
          logger.trace('AppLayoutContainer.show_in -- ' + region_name + ': ' + view);
          this.app.currentView[region_name].show(view);
          this.scroll_to_top();
        }
        else {
          logger.error('AppLayoutContainer.show_region -- ' + region_name + ' is falsey and an invalid region name');
        }
      },

      /**
       * Set the application's application layout view (i.e. set of regions it should be displaying)
       * @param {Object} app_layout_view An AppObjLayout instance
       */
      set_layout: function set_layout(app_layout_view) {
        this.app.show(app_layout_view);
      },

      /**
       * Scrolls the browser to the top
       */
      scroll_to_top: function scroll_to_top() {
        $('html, body').animate({ scrollTop: 0 }, 600);
      }
    });

    /**
     * An application layout with a top-bound navbar, a main region and a footer bar
     * @type {Object}
     */
    Views.AppMenuBarLayout = AppObj.Common.Views.AppObjLayout.extend({
      template: _.template(require('text!js/app/display/templates/header_bar_layout.html')),
      regions: {
        'navbar': 'div#region_navbar',
        'main': 'div#region_main',
        'footer': 'div#region_footer'
      }
    });
  });

  return AppObj.Display.Views;
});
