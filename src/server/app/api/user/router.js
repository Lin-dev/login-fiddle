'use strict';

var helpers = require('app/api/helpers');
var pr = require('app/util/pr');
var auth = require('app/util/auth');

var router_impl = require('app/api/user/router_impl');
var util_router_impl = require('app/api/util/router_impl');

var express = require('express');
var router = new express.Router();

// Account level / auth method independent
router.get('/user', auth.mw.ensure_auth, helpers.inject_pr_into_router_impl(router_impl.get_user, pr));
router.get('/logout', auth.mw.ensure_auth, router_impl.logout);
router.get('/deactivate', auth.mw.ensure_auth, router_impl.deactivate);
////////

// Local access, reactivation, connecting, disconnecting
router.post('/access/local/login', auth.mw.ensure_unauth, router_impl.local_check_login,
  router_impl.access_local_login);
router.post('/access/local/signup', auth.mw.ensure_unauth, router_impl.local_check_signup,
  router_impl.access_local_signup);
router.post('/reactivate/local/login', auth.mw.ensure_unauth, router_impl.local_check_reactivate,
  router_impl.access_local_reactivate);
router.post('/connect/local/connect', auth.mw.ensure_auth, router_impl.local_check_connect,
  router_impl.connect_local_connect);
router.post('/connect/local/disconnect', auth.mw.ensure_auth, router_impl.local_check_connect,
  router_impl.connect_local_disconnect);
////////

// Provider access
router.get('/access/fb/auth', auth.mw.ensure_unauth, router_impl.access_fb_auth);
router.get('/access/fb/callback', auth.mw.ensure_unauth, router_impl.access_fb_callback);
router.get('/access/google/auth', auth.mw.ensure_unauth, router_impl.access_google_auth);
router.get('/access/google/callback', auth.mw.ensure_unauth, router_impl.access_google_callback);
router.get('/access/twitter/auth', auth.mw.ensure_unauth, router_impl.access_twitter_auth);
router.get('/access/twitter/callback', auth.mw.ensure_unauth, router_impl.access_twitter_callback);
////////

// Provider reactivation
router.get('/reactivate/fb/auth', auth.mw.ensure_unauth, router_impl.reactivate_fb_auth);
router.get('/reactivate/fb/callback', auth.mw.ensure_unauth, router_impl.reactivate_fb_callback);
router.get('/reactivate/google/auth', auth.mw.ensure_unauth, router_impl.reactivate_google_auth);
router.get('/reactivate/google/callback', auth.mw.ensure_unauth, router_impl.reactivate_google_callback);
router.get('/reactivate/twitter/auth', auth.mw.ensure_unauth, router_impl.reactivate_twitter_auth);
router.get('/reactivate/twitter/callback', auth.mw.ensure_unauth, router_impl.reactivate_twitter_callback);
////////

// Provider connecting and disconnecting
router.get('/connect/fb/auth', auth.mw.ensure_auth, router_impl.connect_fb_auth);
router.get('/connect/fb/callback', auth.mw.ensure_auth, router_impl.connect_fb_callback,
  util_router_impl.redirect_to_profile);
router.post('/connect/fb/disconnect', auth.mw.ensure_auth, router_impl.connect_fb_disconnect);
router.get('/connect/google/auth', auth.mw.ensure_auth, router_impl.connect_google_auth);
router.get('/connect/google/callback', auth.mw.ensure_auth, router_impl.connect_google_callback,
  util_router_impl.redirect_to_profile);
router.post('/connect/google/disconnect', auth.mw.ensure_auth, router_impl.connect_google_disconnect);
router.get('/connect/twitter/auth', auth.mw.ensure_auth, router_impl.connect_twitter_auth);
router.get('/connect/twitter/callback', auth.mw.ensure_auth, router_impl.connect_twitter_callback,
  util_router_impl.redirect_to_profile);
router.post('/connect/twitter/disconnect', auth.mw.ensure_auth, router_impl.connect_twitter_disconnect);
////////

module.exports = router;
