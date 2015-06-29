define(function(require) {
  'use strict';

  var q = require('q');
  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/header/entities');

  AppObj.module('HeaderApp.Entities', function(Entities, AppObj, Backbone, Marionette, $, _) {
    require('js/common/base_entities');

    Entities.NavItem = AppObj.Common.Entities.ClientModel.extend({
      __name: 'NavItem',
      initialize: function initialize() {
        logger.trace('NavItem.initialize -- enter w/ url: ' + this.get('url'));
        _.extend(this, new Backbone.Picky.Selectable(this));
        logger.trace('NavItem.initialize -- exit');
      }
    });

    Entities.NavItemCollection = AppObj.Common.Entities.AppObjClientOnlyCollection.extend({
      __name: 'NavItemCollection',
      model: Entities.NavItem,

      initialize: function initialize() {
        logger.trace('NavItemCollection.initialize -- enter');
        _.extend(this, new Backbone.Picky.SingleSelect(this));
        logger.trace('NavItemCollection.initialize -- exit');
      }
    });

    var initialize_navitems = function initialize_navitems() {
      logger.trace('initialize_navitems -- enter');
      Entities.navitem_collection = new Entities.NavItemCollection([
        { name: 'Home Page',  url: 'home',     nav_trigger: 'home:show',     icon: 'glyphicon-home' },
        { name: 'Entries',    url: 'entry',    nav_trigger: 'entry:list',    icon: 'glyphicon-th-list' },
        { name: 'Session',    url: 'session',  nav_trigger: 'session:show',  icon: 'glyphicon-book'  },
        { name: 'Profile',    url: 'user',     nav_trigger: 'user:profile',  icon: 'glyphicon-user' },
        { name: 'About',      url: 'about',    nav_trigger: 'about:show',    icon: 'glyphicon-tree-conifer' }
      ]);
      logger.trace('initialize_navitems -- exit');
    };

    var API = {
      get_navitem_promise: function get_navitem_promise() {
        logger.trace('API.get_navitem_promise -- enter');
        var deferred = q.defer();
        if(Entities.navitem_collection === undefined) {
          logger.trace('API.get_navitem_promise -- initializing navitems');
          initialize_navitems();
        }
        deferred.resolve(Entities.navitem_collection);
        logger.trace('API.get_navitems_promise -- exit');
        return deferred.promise;
      }
    };

    AppObj.reqres.setHandler('headerapp:entities:navitems', function() {
      logger.trace('AppObj.reqres - headerapp:entities:navitems -- enter');
      var result = API.get_navitem_promise();
      logger.trace('AppObj.reqres - headerapp:entities:navitems -- exit');
      return result;
    });
  });

  return AppObj.HeaderApp.Entities;
});
