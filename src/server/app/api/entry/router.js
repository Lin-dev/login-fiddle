'use strict';

var helpers = require('app/api/helpers');
var pr = require('app/util/pr');

var router_impl = require('app/api/entry/router_impl');

var express = require('express');
var router = new express.Router();
router.get('/entry/:tag_string?', helpers.inject_pr_into_router_impl(router_impl.get_entries, pr));
router.get('/tag', helpers.inject_pr_into_router_impl(router_impl.get_tags, pr));

module.exports = router;
