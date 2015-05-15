'use strict';

var _ = require('underscore');
var glob = require('glob');
var should = require('should');
var sinon = require('sinon');

var is_application_file = function(filename) {
  return !/.*_itest\.js/.test(filename) && !/.*_utest\.js/.test(filename);
};

module.exports = {
  /**
   * Return an array with all application JS files, filtering out test files (*_utest.js, *_itest.js)
   *
   * @param  {String} dir The directory to search inside
   * @return {Array}      Array of String with the relative paths to the files in dir
   */
  js_app_files_in_dir: function(dir) {
    return glob.sync(dir + '/**/*.js').filter(is_application_file);
  },

  /**
   * Returns an array with all application JS files, filtering out test files (*_utest.js, *_itest.js) and any files
   * called router.js (they are Express Router objects)
   *
   * @param  {String} dir The directory to search inside
   * @return {Array}      Array of String with the relative paths to the files in dir
   */
  js_app_files_not_router_in_dir: function(dir) {
    return this.js_app_files_in_dir(dir).filter(function(filename) {
      return !/.*\/router.js/.test(filename);
    });
  },

  /**
   * Returns the number of functions exported by a module
   * @param  {String} require_path The path to the module for require
   * @return {Number}              The number of functions
   */
  num_func_in_module: function(require_path) {
    return _.functions(require(require_path)).length;
  },

  /**
   * Returns the number of non-functions exported by a module
   * @param  {String} require_path The path to the module for require
   * @return {Number}              The number of functions
   */
  num_nonfunc_in_module: function(require_path) {
    var module = require(require_path);
    var module_functions = _.functions(module);
    return _.keys(module).filter(function(property) { return module_functions.indexOf(property) === -1; }).length;
  },

  /**
   * Returns a sinon stub that returns a mock promise whose `then` function that ignores the any function
   * passed to it and instead immediately returns a stub object with a `done` spy. This means that
   * functions inside then callbacks will not be called. The mock promise, then and done functions are
   * all Sinon spies.
   *
   * @return {Object} A mock promise that allows `{returnedObject}(arguments).then(function).done()`
   */
  stub_then_done: function() {
    var mock_then_done_promise = { then: sinon.spy(function() { return { done: sinon.spy() }; }) };
    return sinon.spy(function() { return mock_then_done_promise; });
  },

  /**
   * Returns a should it() test that validates the number of tests executed and stored in an object map versus the
   * number of properties, functions (or using some other comparison) on the objects exported by files in a directory
   * path. The purpose of this is to confirm that the tests which wrote values to the object map tested everything of
   * the right type exported by the files in the directory path.
   *
   * @param  {[type]} description_string The description of the test to be created
   * @param  {[type]} load_path          The directory path to load the files to check exports for
   * @param  {[type]} export_type_string The string describing the type of check, e.g. 'method exports'
   * @param  {[type]} comp_map           The object map keyed by file with the number of checks for each file checked
   * @param  {[type]} comp_func          The comparison function taking a path to a file to compare against comp_map
   * @return {[type]}                    A should it() test
   */
  create_test_to_check_exports: function(description_string, load_path, export_type_string, comp_map, comp_func) {
    var that = this;

    return it(description_string, function() {
      var js_files = that.js_app_files_not_router_in_dir(load_path);
      js_files.forEach(function(js_file) {
        var req_path = js_file.replace(/\.\/src\/server\//, '').replace(/\.js$/, '');
        should(comp_map[req_path]).not.be.type('undefined', req_path + ' ' + export_type_string + ' not checked');
        if(comp_map[req_path] !== undefined) {
          var nf_tested = comp_map[req_path];
          var nf_in_module = comp_func(req_path);
          nf_tested.should.equal(nf_in_module,
            req_path + ' only ' + nf_tested + ' of ' + nf_in_module + ' ' + export_type_string + ' checked');
        }
      });
    });
  }
};
