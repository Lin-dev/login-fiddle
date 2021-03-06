// NO LOGGING IN THIS FILE

define(function(require) {
  'use strict';

  var _ = require('underscore');
  var $ = require('jquery');
  var moment = require('moment');

  /**
   * Console appender is responsible for writing a message to the console and nothing else. The Logger is responsible
   * for deciding whether or not the message should be logged and for formatting the message appropriately.
   *
   * @param {Object} options Options - currently none used
   */
  var ConsoleAppender = function ConsoleAppender(options) {
    if(!window.console) {
      window.console = {};
    }
    this.log = console.info ? console.info.bind(console) : console.log ? console.log.bind(console) : function log() {};
    this.info = this.log;

    this.debug = console.debug ? console.debug.bind(console) : this.info;
    this.trace = this.debug; // not console.trace ? console.trace.bind(console) : this.debug; because auto stack trace

    this.warn = console.warn ? console.warn.bind(console) : this.log;
    this.error = console.error ? console.error.bind(console) : this.warn;
    this.fatal = console.fatal ? console.bind.fatal(console) : this.error;

    this.temp_only = this.error; // use for temporary logging statements - easily grep to remove
  };

  /**
   * A logger object, associated with a group and with some set of appenders attached to it
   * @param {Object} options Required and possible properties are String:level Array[String]:appenders, String:group
   */
  var Logger = function Logger(options) {
    // PRIVATE FIELDS AND FUNCTIONS
    var that = this;

    /**
     * Returns an appropriate appender object for an appender string from a logger config. Valid strings (case
     * insensitive) are:
     * - console
     */
    var parse_appenders = function parse_appenders(appender_strings) {
      var appender_objects = [];
      _.each(appender_strings, function(appender_string) {
        switch(appender_string.toLowerCase()) {
          case 'console': appender_objects.push(new ConsoleAppender()); break;
          default: throw new Error('Unknown appender string: ' + appender_string);
        }
      });
      if(appender_objects.length === 0) {
        throw new Error('No appenders defined for logger ' + that.group);
      }
      return appender_objects;
    };
    // END PRIVATE FUNCTIONS

    // PUBLIC PRIVILEGED METHODS
    /**
     * Converts level string from logger config into Log4js enum. Valid strings (case insensitive) are: all. trace,
     * debug, info, warn, error, fatal
     */
    this.parse_level = function parse_level(level_string) {
      var levels = {
        all:   0,
        trace: 100,
        debug: 200,
        info:  300,
        warn:  400,
        error: 500,
        fatal: 600,
        off:   9999
      };
      if(levels[level_string.toLowerCase()] !== undefined) { return levels[level_string.toLowerCase()]; }
      else { throw new Error('Unknown log level string: ' + level_string); }
    };

    /**
     * Build log message string based on message and log-level
     * @param  {String} message      The message to be logged
     * @param  {String} level_string A log level string, e.g. trace, info, fatal
     * @return {String}              The assembled log message string
     */
    this.assemble_log_entry = function assemble_log_entry(message, level_string) {
      var timestamp = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      return timestamp + ' ' + level_string.toUpperCase() + ' [' + that.group + '] ' + message;
    };
    // END PUBLIC PRIVILEGED METHODS

    // CONFIGURE OBJECT, PUBLIC FIELDS
    this.group = options.group;
    this.appenders = parse_appenders(options.appenders);
    this.log_level = this.parse_level(options.level);
    // END CONFIGURE OBJECT
  };

  // PUBLIC-ACCESSIBLE, UNPRIVILEGED METHODS ON THE PROTOTYPE
  Logger.prototype.is_trace_enabled = function is_trace_enabled() {
    return this.log_level <= this.parse_level('trace');
  };

  Logger.prototype.trace = function trace(message) {
    if(this.is_trace_enabled()) {
      var log_entry = this.assemble_log_entry(message, 'trace');
      _.each(this.appenders, function(appender) {
        appender.trace(log_entry);
      });
    }
  };

  Logger.prototype.is_debug_enabled = function is_debug_enabled() {
    return this.log_level <= this.parse_level('debug');
  };

  Logger.prototype.debug = function debug(message) {
    if(this.is_debug_enabled()) {
      var log_entry = this.assemble_log_entry(message, 'debug');
      _.each(this.appenders, function(appender) {
        appender.debug(log_entry);
      });
    }
  };

  Logger.prototype.is_info_enabled = function is_info_enabled() {
    return this.log_level <= this.parse_level('info');
  };

  Logger.prototype.info = function info(message) {
    if(this.is_info_enabled()) {
      var log_entry = this.assemble_log_entry(message, 'info');
      _.each(this.appenders, function(appender) {
        appender.info(log_entry);
      });
    }
  };

  Logger.prototype.is_warn_enabled = function is_warn_enabled() {
    return this.log_level <= this.parse_level('warn');
  };

  Logger.prototype.warn = function warn(message) {
    if(this.is_warn_enabled()) {
      var log_entry = this.assemble_log_entry(message, 'warn');
      _.each(this.appenders, function(appender) {
        appender.warn(log_entry);
      });
    }
  };

  Logger.prototype.is_error_enabled = function is_error_enabled() {
    return this.log_level <= this.parse_level('error');
  };

  Logger.prototype.error = function error(message) {
    if(this.is_error_enabled()) {
      var log_entry = this.assemble_log_entry(message, 'error');
      _.each(this.appenders, function(appender) {
        appender.error(log_entry);
      });
    }
  };

  Logger.prototype.is_fatal_enabled = function is_fatal_enabled() {
    return this.log_level <= this.parse_level('fatal');
  };

  Logger.prototype.fatal = function fatal(message) {
    if(this.is_fatal_enabled()) {
      var log_entry = this.assemble_log_entry(message, 'fatal');
      _.each(this.appenders, function(appender) {
        appender.fatal(log_entry);
      });
    }
  };

  Logger.prototype.temp_only = function temp_only(message) {
    var log_entry = this.assemble_log_entry(message, 'temp-only');
    _.each(this.appenders, function(appender) {
      appender.temp_only(log_entry);
    });
  };
  // END PUBLIC-ACCESSIBLE, UNPRIVILEGED METHODS ON THE PROTOYPE



  /**
   * Returns the most specific conf in log_config for a given group.
   *
   * E.g. if a logger config defines group configurations for js, js/foo and js/foo/bar/baz then the logger for
   * js/foo/bar/baz will use the config for js/foo/bar/baz, the logger for js/foo/bar will use the config for js/foo
   * and attempting to get the group configuration for baz will throw an error.
   *
   * @param  {String} group_string The group string to specify, /-delimited and assumed to begin with js
   * @param  {Object} log_config   The logger configuration
   * @return {Object}              A conf object with fields log_level and appenders
   */
  var get_group_config_clone = function get_group_config_clone(group_string, log_config) {
    var group_elements = group_string.split('/');
    var current_level = log_config;
    for(var i = 0; i < group_elements.length; ++i) {
      var current_group = group_elements[i];
      if(current_level[current_group]) {
        current_level = current_level[current_group];
      }
      else {
        break;
      }
    }
    if(!current_level.conf) {
      throw new Error('Group config for "' + group_string + '" is ' + current_level.conf);
    }
    else {
      return $.extend(true, {}, current_level.conf); // TODO check this deep copies as expected
    }
  };

  /**
   * Returned from this module, can be used to build logs according to the log_config parameter
   */
  var logger_builder = function logger_builder(log_config) {
    var existing_loggers = {};

    return {
      /**
       * Returns a logger object that is configured according to the application config.logger property. If the logger
       * has been created before then a cached copy is returned.
       *
       * @param  {String} group The logger group - usually the path to the javascript file
       * @return {Object}       A logger object for {{group}}
       */
      get: function get(group) {
        if(existing_loggers[group]) {
          return existing_loggers[group];
        }
        else {
          var logger_specific_config = get_group_config_clone(group, log_config);
          logger_specific_config.group = group;
          existing_loggers[group] = new Logger(logger_specific_config);
          return existing_loggers[group];
        }
      }
    };
  };

  return logger_builder;
});
