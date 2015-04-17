'use strict';

var _ = require('underscore');

var logger_module = require('app/util/logger');
var logger = logger_module.get('app/api/session/router_impl');

module.exports = {
  /**
   * Returns JSON with session start time stamp
   */
  get_session: function(req, res, next) {
    logger.trace('exports.get_session -- enter');
    req.session.views = req.session.views ? req.session.views++ : 1;
    var result = {
      start: req.session.start,
      views: req.session.views
    }
    res.status(200).send(result);
  }
};
