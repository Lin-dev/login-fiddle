'use strict';

var router_impl = require('app/api/session/router_impl');

var express = require('express');
var router = new express.Router();
router.get('/session', router_impl.get_session);

module.exports = router;
