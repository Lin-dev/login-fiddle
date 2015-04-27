'use strict';

var helpers = require('app/api/helpers');
var pr = require('app/util/pr');

var router_impl = require('app/api/user/router_impl');

var express = require('express');
var router = new express.Router();
router.get('/user', helpers.inject_pr_into_router_impl(router_impl.get_user, pr));
router.put('/user', helpers.inject_pr_into_router_impl(router_impl.put_user, pr));
router.delete('/user', helpers.inject_pr_into_router_impl(router_impl.delete_user, pr));
router.post('/login', router_impl.login);
router.post('/logout', router_impl.logout);
router.post('/signup', router_impl.signup);

module.exports = router;
