'use strict';

var helpers = require('app/api/helpers');
var pr = require('app/util/pr');
var auth = require('app/util/auth');

var router_impl = require('app/api/user/router_impl');

var express = require('express');
var router = new express.Router();
router.get('/user', auth.mw.ensure_auth, helpers.inject_pr_into_router_impl(router_impl.get_user, pr));
router.get('/logout', auth.mw.ensure_auth, router_impl.logout);
router.post('/access/local/login', auth.mw.ensure_unauth, router_impl.access_local_login);
router.post('/access/local/signup', auth.mw.ensure_unauth, router_impl.access_local_signup);

module.exports = router;
