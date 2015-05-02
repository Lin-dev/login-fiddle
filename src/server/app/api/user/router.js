'use strict';

var helpers = require('app/api/helpers');
var pr = require('app/util/pr');
var auth = require('app/util/auth');

var router_impl = require('app/api/user/router_impl');

var express = require('express');
var router = new express.Router();
router.get('/user', auth.ensure_authenticated, helpers.inject_pr_into_router_impl(router_impl.get_user, pr));
router.put('/user', auth.ensure_authenticated, helpers.inject_pr_into_router_impl(router_impl.put_user, pr));
router.delete('/user', auth.ensure_authenticated, helpers.inject_pr_into_router_impl(router_impl.delete_user, pr));
router.post('/login', auth.ensure_unauthenticated, router_impl.login);
router.get('/logout', auth.ensure_authenticated, router_impl.logout);
router.post('/signup', auth.ensure_unauthenticated, router_impl.signup);

module.exports = router;
