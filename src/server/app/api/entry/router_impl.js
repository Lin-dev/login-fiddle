'use strict';

var _ = require('underscore');
var q = require('q');

var logger_module = require('app/util/logger');
var logger = logger_module.get('app/api/entry/router_impl');



var local = {
  /**
   * This function is for handling rejected promises in an Entry router callback. It takes the response object as its
   * first argument and the promise rejection error as its final argument. Intended usage in a router implementation
   * function is:
   *     `promise.fail(local.handle_route_function_rejected_promise.bind(this, res));`
   *
   * Note that this function and signature may be usable in other API modules in the future, but in the current
   * application its is only used in the Entry API module.
   *
   * @param  {Object} res The response object passed to the router implementation (Express middleware)
   * @param  {Object} err The rejected promise's error value
   * @return {Object}     The `err` parameter
   */
  handle_route_function_rejected_promise: function handle_route_function_rejected_promise(res, err) {
    if(err && err.stack) {
      logger.error('local.handle_route_function_rejected_promise -- ' + err);
      logger.error(err.stack);
    }
    else {
      logger.error('local.handle_route_function_rejected_promise -- ' + err + ' (no stack)');
    }
    res.status(500).end();
    return err;
  }
};



module.exports = {
  /**
   * Returns JSON for all entries which match an (optional) tag string, does not call next()
   */
  get_entries: function get_entries(pr, req, res, next) {
    logger.trace('exports.get_entries -- enter');
    if(req.params.tag_string) {
      q(pr.pr.entry.tag.find({
        where: { value: req.params.tag_string },
        include: [{ model: pr.pr.entry.entry, include: [pr.pr.entry.tag] }]
      }))
      .then(function(tag) {
        res.status(200).send(_.map(tag.entries, function(entry) {
          return entry.get({ plain: true});
        }));
      })
      .fail(local.handle_route_function_rejected_promise.bind(this, res))
      .done();
    }
    else {
      q(pr.pr.entry.entry.findAll({ include: [{model: pr.pr.entry.tag }]})
      .then(function(entry_instances) {
        res.status(200).send(_.map(entry_instances, function(entry) { return entry.get({ plain: true }); }));
      }))
      .fail(local.handle_route_function_rejected_promise.bind(this, res))
      .done();
    }
  },

  /**
   * Returns JSON for all tags, does not call next()
   */
  get_tags: function get_tags(pr, req, res, next) {
    logger.trace('exports.get_tags -- enter');
    q(pr.pr.entry.tag.findAll())
    .then(function(tag_instances) {
      res.status(200).send(_.map(tag_instances, function(tag) { return tag.get({ plain: true}); }));
    })
    .fail(local.handle_route_function_rejected_promise.bind(this, res))
    .done();
  }
};
