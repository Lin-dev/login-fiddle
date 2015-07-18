'use strict';

var _ = require('underscore');
var q = require('q');

var logger_module = require('app/util/logger');
var logger = logger_module.get('app/api/entry/router_impl');

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
      .fail(function(err) {
        logger.error('exports.get_entries -- promise fail: ' + err);
        res.status(500).end();
      })
      .done();
    }
    else {
      q(pr.pr.entry.entry.findAll({ include: [{model: pr.pr.entry.tag }]})
      .then(function(entry_instances) {
        res.status(200).send(_.map(entry_instances, function(entry) { return entry.get({ plain: true }); }));
      }))
      .fail(function(err) {
        logger.error('exports.get_entries -- promise fail: ' + err);
        res.status(500).end();
      })
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
    .fail(function(err) {
      logger.error('exports.get_tags -- promise fail: ' + err);
      res.status(500).end();
    });
  }
};
