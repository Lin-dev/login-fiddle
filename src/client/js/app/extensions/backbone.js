// NO LOGGING IN THIS FILE

/**
 * This require does two things:
 * - Extends Backbone.Model, .View, .Router and .Collection to use named constructors for more informative debugging
 * - Changes Backbone.Model.toString and Backbone.Collection.toString for more informative debugging
 *
 * The define returns undefined because it alters the global Backbone object
 *
 * Extensions based on:
 * - http://stackoverflow.com/a/15034014/1149568
 * - http://stackoverflow.com/a/14869218/1149568
 */
define(function(require) {
  'use strict';
  var _ = require('underscore');
  var Backbone = require('backbone');

  function createNamedConstructor(name, constructor) {
    // Explicitly allow use of Function constructor here
    /* jshint -W054 */
    var fn = new Function('constructor', 'return function ' + name + '() {\n' +
      '  // wrapper function created dynamically for "' + name + '" constructor to allow instances to be\n' +
      '  // identified in the debugger\n' +
      '  constructor.apply(this, arguments);\n' +
      '};');
    return fn(constructor);
  }

  var original_extend = Backbone.View.extend; // Model, Collection, Router and View shared the same extend function
  var name_property = '__name';

  var newExtend = function newExtend(protoProps, classProps) {
    if (protoProps && protoProps.hasOwnProperty(name_property)) {
      var name = protoProps[name_property]; // NB: this does not check that name_property is a valid identifier
      // wrap constructor from protoProps if supplied or 'this' (the function we are extending)
      var constructor = protoProps.hasOwnProperty('constructor') ? protoProps.constructor : this;
      protoProps = _.extend(protoProps, {
        constructor: createNamedConstructor(name, constructor)
      });
    }
    return original_extend.call(this, protoProps, classProps);
  };

  Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = newExtend;

  Backbone.Model.prototype[name_property] = 'Model';
  Backbone.Collection.prototype[name_property] = 'Collection';
  Backbone.Router.prototype[name_property] = 'Router';
  Backbone.View.prototype[name_property] = 'View';

  Backbone.Model.prototype.toString = function toString() {
    return this[name_property] + '(cid: ' + this.cid + ', attr: ' + JSON.stringify(this.attributes) + ')';
  };

  Backbone.Collection.prototype.toString = function toString() {
    return this[name_property] + '(models: ' + JSON.stringify(this.models) + ')';
  };

  Backbone.View.prototype.toString = function toString() {
    return this[name_property] + '(cid: ' + this.cid + ', outerHTML: ' + this.$el.prop('outerHTML') + ')';
  };

  return undefined;
});
