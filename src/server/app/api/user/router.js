'use strict';

var pr = require('app/util/pr');

var router_impl = require('app/api/user/router_impl');

/**
 * TODO: Extract this and other funcs like it to a separate module (app/api/helpers?)
 *
 * Returns a function with the right signature for an Express router from a router implementation function
 * @param  {Function} router_impl A router implementation function, taking pr, req, res, next
 * @param  {Object}   pr          The PR module (to be injected)
 * @return {Function}             A router function which takes res, res and next and calls the impl param func
 */
function inject_pr(route_impl_func, pr) {
  return function(req, res, next) {
    return route_impl_func(pr, req, res, next);
  };
}

var express = require('express');
var router = new express.Router();
router.get('/user', inject_pr(router_impl.get_user, pr));
router.put('/user', inject_pr(router_impl.put_user, pr));
router.delete('/user', inject_pr(router_impl.delete_user, pr));
router.post('/login', router_impl.login);
router.post('/logout', router_impl.logout);
router.post('/signup', router_impl.signup);

module.exports = router;
