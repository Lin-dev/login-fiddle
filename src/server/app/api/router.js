'use strict';

// No logger defined or used because file code is just Express glue

var express = require('express');
var router = new express.Router();

router.use('/entry', require('app/api/entry/router'));
router.use('/session', require('app/api/session/router'));
router.use('/user', require('app/api/user/router'));
router.use('/util', require('app/api/util/router'));

module.exports = router;
