'use strict';

var router_impl = require('app/api/util/router_impl');

var express = require('express');
var router = new express.Router();
router.get('/success', router_impl.success);
router.get('/failure', router_impl.failure);
router.get('/flash_message', router_impl.flash_message);

module.exports = router;
