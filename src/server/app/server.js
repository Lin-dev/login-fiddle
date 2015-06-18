'use strict';

var body_parser = require('body-parser');
var compression = require('compression');
var connect_flash = require('connect-flash');
var errorhandler = require('errorhandler');
var express = require('express');
var fs = require('fs');
var https = require('https');
var https_redirect = require('https-redirect-server');
var method_override = require('method-override');
var log4js = require('log4js');
var path = require('path');
var q = require('q');
var serve_favicon = require('serve-favicon');
var session = require('express-session');

var RedisStore = require('connect-redis')(session);

var server_config = require('app/config/server');
var user_config = require('app/config/user');
var auth_module = require('app/util/auth');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/server');

process.on('uncaughtException', function(err) {
  if(logger) {
    logger.error('Uncaught exception, exiting: ' + err.name + ' ' + err.message);
    logger.error(err.stack);
  }
  else {
    console.error('BACKUP LOG TO CONSOLE IN CASE OF TOTAL SERVER/LOGGER FAILURE:\n' + err.stack);
  }
  process.exit();
});

Error.stackTraceLimit = Infinity;
q.longStackSupport = server_config.q_longStackSupport;
https_redirect(server_config.http_port, server_config.https_port).server();
logger.info('HttpsRedirectServer redirecting from ' + server_config.http_port + ' to ' + server_config.https_port);
var https_server = create_https_server();
https_server.listen(server_config.https_port, function() {
  logger.info('Express HTTPS server listening on port ' + server_config.https_port);
});


/**
 * Sets up Express application middleware:
 * - Logging
 * - Request parsing
 * - Static route serving
 * - Cookies and sessions
 * - Dynamic routes
 * - Fall back to sending index.html if nothing else matches
 * - Error handling (not appropriate for production)
 */
function configure_app_middleware(app) {
  var logger_config = require('app/config/logger');

  // (1) Logging
  app.use(log4js.connectLogger(logger_module.get_log4js('connect-appender'), {
    level: 'auto',
    layout: 'basic',
    immediate: true,
    format: logger_config.express_format,
    tokens: logger_config.custom_tokens
  }));

  // (2) Parse request
  app.use(body_parser.json());
  app.use(body_parser.urlencoded({ extended: false }));
  app.use(method_override('X-HTTP-Method'));          // Microsoft
  app.use(method_override('X-HTTP-Method-Override')); // Google/GData
  app.use(method_override('X-Method-Override'));      // IBM

  // (3) Serve static routes
  app.use(compression());
  app.use(serve_favicon(path.join(server_config.client_root, 'assets', 'images', 'favicons', 'favicon.ico')));
  app.use('/assets', express.static(path.join(server_config.client_root, 'assets'),
    { maxAge: server_config.static_max_age }));
  app.use('/bower_components', express.static(path.join(server_config.client_root, 'bower_components'),
    { maxAge: server_config.static_max_age }));
  app.use('/js', express.static(path.join(server_config.client_root, 'js'), { maxAge: server_config.static_max_age }));

  // (4) Cookies and sessions
  app.use(session({
    cookie: {
      maxAge: user_config.session.cookie.maxAge,
      secure: user_config.session.cookie.secure
    },
    resave: user_config.session.resave,
    rolling: user_config.session.rolling,
    saveUninitialized: false,
    secret: user_config.session.secret,
    store: new RedisStore({
      host: user_config.session.store.host,
      port: user_config.session.store.port,
      db: user_config.session.store.db
    })
  }));
  app.use(auth_module.passport.initialize());
  app.use(auth_module.passport.session());
  app.use(auth_module.mw.set_client_auth_status_cookie);
  app.use(connect_flash());
  app.use(auth_module.mw.set_session_start_date);

  // (5) Serve dynamic routes
  app.use('/api', require('app/api/router'));

  // (6) Fall back to always sending index.html - it should handle 404's
  app.use(function(req, res, next) {
    logger.debug('client request ' + req.originalUrl + ' (route: ' + JSON.stringify(req.route) +
      ') has fallen through to index.html catch');
    res.sendFile(path.join(server_config.client_root, 'index.html'));
  });

  // (7) Error handling
  // TODO not appropriate for a prod site, see SES / http://calv.info/node-and-express-tips/ for another approach:
  app.use(errorhandler({ showStack: true, dumpExceptions: true }));
}



/**
 * Creates HTTPS server object for application
 * @return {Object} Express server object with initialised middleware
 */
function create_https_server() {
  var https_creds = {
    key: fs.readFileSync(path.join(server_config.security_dir, 'key.pem')),
    cert: fs.readFileSync(path.join(server_config.security_dir, 'cert.pem'))
  };
  var app = express();
  configure_app_middleware(app);
  return https.createServer(https_creds, app);
}
