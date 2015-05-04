'use strict';

var helpers = require('app/api/helpers');
var pr = require('app/util/pr');
var auth = require('app/util/auth');

var router_impl = require('app/api/user/router_impl');

var express = require('express');
var router = new express.Router();
router.get('/user', auth.ensure_authenticated, helpers.inject_pr_into_router_impl(router_impl.get_user, pr));
router.get('/logout', auth.ensure_authenticated, router_impl.logout);
router.post('/access/local', auth.ensure_unauthenticated, router_impl.access_local);

module.exports = router;
