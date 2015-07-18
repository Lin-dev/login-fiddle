'use strict';

// No logger defined or used because file code is just Express glue

var fs = require('fs');

var express = require('express');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/api/router');
var router = new express.Router();

var all_possible_api_modules = fs.readdirSync(__dirname);
all_possible_api_modules.forEach(function(possible_module_name) {
  try {
    var require_path = 'app/api/' + possible_module_name + '/router';
    var possible_router = require(require_path);

    if(possible_router !== undefined) { // then possible module is a real module and possible_router is a real router
      var server_requests_path = '/' + possible_module_name;
      logger.debug('API module mapped to ' + server_requests_path + ' - ' + require_path);
      router.use(server_requests_path, possible_router);
    }
  }
  catch(e) {
    logger.debug('API module not present at ' + require_path);
  }
});

module.exports = router;
