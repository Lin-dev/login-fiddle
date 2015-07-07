'''
Application file configuration

Guides user through configuration file changes, writing the changes to disk. Does not move, copy, backup or otherwise
edit any files. Does not make any database changes. Does not restart the web application
'''

#!/usr/bin/python

import os.path as path
import lib.general as general
import lib.configure as configure

def prompt_for_configure_directories():
  current_value_install_dir = \
    general.prompt_for_text('Please enter the directory location of the currently installed app to read from: ').strip()
  output_value_install_dir = \
    general.prompt_for_text('Please enter the directory location of the currently installed app to write to:  ').strip()
  return (current_value_install_dir, output_value_install_dir)



def configure_app(current_value_install_dir, output_value_install_dir):
  '''
  Specifies the configuration option groups for the application and calls configure_options on each
  '''
  groups = []

  groups.append(configure.Group(
    group_name='General server setup',
    current_value_install_dir=current_value_install_dir,
    output_value_install_dir=output_value_install_dir,
    default_config_file_rel_path='./server/app/config/server.js'
  ))
  groups[-1].add_option(
    name='HTTP port',
    desc='The HTTP port that the server listens on [number]',
    re_string='http_port: (\d+),? // configure.py: server'
  )
  groups[-1].add_option(
    name='HTTPS port',
    desc='The HTTPS port that the server listens on [number]',
    re_string='https_port: (\d+),? // configure.py: server'
  )
  groups[-1].add_option(
    name='Server host',
    desc='The servers externally accessible hostname or IP address [host or IP]',
    re_string='server_host: \'([a-zA-Z_0-9.]+)\',? // configure.py: server'
  )
  groups[-1].add_option(
    name='Q.js long stack trace support',
    desc='Enable long stack traces from Q [true or false]',
    re_string='q_longStackSupport: (true|false|undefined),? // configure.py: server'
  )
  groups[-1].add_option(
    name='Static cache max age',
    desc='The maximum length of time a static element is cached by the server [number]',
    re_string='static_max_age: (\d+),? // configure.py: server'
  )

  groups.append(configure.Group(
    group_name='Server application logging',
    current_value_install_dir=current_value_install_dir,
    output_value_install_dir=output_value_install_dir,
    default_config_file_rel_path='./server/app/util/logger/logger_config.json'
  ))
  groups[-1].add_option(
    name='Server app log level',
    desc='The log level for server app/* loggers; set other options/granular logging manually [log level string]',
    re_string='"level": "([^"]*)"'
  )

  groups.append(configure.Group(
    group_name='Database information',
    current_value_install_dir=current_value_install_dir,
    output_value_install_dir=output_value_install_dir,
    default_config_file_rel_path='./server/app/config/database.js'
  ))
  groups[-1].add_option(
    name='DB name',
    desc='The database name [a valid string]',
    re_string='name: \'([a-zA-Z_]*)\',? // configure.py: database'
  )
  groups[-1].add_option(
    name='DB name check',
    desc='This is used by Sequelize to validate that changes are being made to the correct DB [the same as the name]',
    re_string='database_name_check_before_sync: /([a-zA-Z_]*)/,? // configure.py: database'
  )
  groups[-1].add_option(
    name='DB user',
    desc='The database username [a valid string]',
    re_string='user: \'([a-zA-Z_]*)\',? // configure.py: database'
  )
  groups[-1].add_option(
    name='DB user password',
    desc='The database user password [a valid string]',
    re_string='password: \'(.+)\',? // configure.py: database'
  )
  groups[-1].add_option(
    name='DB host',
    desc='The database host [a URI]',
    re_string='host: \'([a-zA-Z_.]*)\',? // configure.py: database'
  )
  groups[-1].add_option(
    name='DB port',
    desc='The database port [a number, probably greater than 1024]',
    re_string='port: \'([\d]+)\',? // configure.py: database'
  )
  groups[-1].add_option(
    name='DB schema',
    desc='The database schema to use [a valid string]',
    re_string='schema: \'([a-zA-Z_]+)\',? // configure.py: database'
  )
  groups[-1].add_option(
    name='Maximum DB connections',
    desc='DB connections pool - maximum number of connections to have open [a number]',
    re_string='maxConnections: (\d+),? // configure.py: database'
  )
  groups[-1].add_option(
    name='Minimum DB connections',
    desc='DB connections pool - minimum number of connections to have open [a number]',
    re_string='minConnections: (\d+),? // configure.py: database'
  )
  groups[-1].add_option(
    name='Max idle time',
    desc='Maximum DB connection open idle time (in milliseconds) [a number]',
    re_string='maxIdleTime: (\d+),? // configure.py: database'
  )

  groups.append(configure.Group(
    group_name='User configuration',
    current_value_install_dir=current_value_install_dir,
    output_value_install_dir=output_value_install_dir,
    default_config_file_rel_path='./server/js/app/user.js'
  ))
  groups[-1].add_option(
    name='Facebook - client id',
    desc='For application (client, server config should be equal) [a number]',
    re_string='client_id: \'(\d+)\',? // configure.py: user-facebook'
  )
  groups[-1].add_option(
    name='Facebook - client secret',
    desc='For application (do not share this information or record it elsewhere) [a hex string]',
    re_string='client_secret: \'([abcdef\d]+)\',? // configure.py: user-facebook'
  )
  groups[-1].add_option(
    name='Google - client id',
    desc='For application (client, server config should be equal) [an alphanumeric string with - and .]',
    re_string='client_id: \'([a-zA-Z_.0-9]+)\',? // configure.py: user-google'
  )
  groups[-1].add_option(
    name='Google - client secret',
    desc='For application (do not share this information or record it elsewhere) [an alphanumeric string with - and .]',
    re_string='client_secret: \'([a-zA-Z_.0-9]+)\',? // configure.py: user-google'
  )
  groups[-1].add_option(
    name='Twitter - consumer key',
    desc='For application (client, server config should be equal) [an alphanumeric string]',
    re_string='consumer_key: \'([a-zA-Z0-9.]+)\',? // configure.py: user-twitter'
  )
  groups[-1].add_option(
    name='Twitter - consumer secret',
    desc='For application (do not share this information or record it elsewhere) [an alphanumeric string]',
    re_string='client_secret: \'([a-zA-Z0-9]+)\',? // configure.py: user-twitter'
  )
  groups[-1].add_option(
    name='Logged in cookie name',
    desc='Cookie name set to indicate logged in (client, server config should be equal) [alphabet string with _])',
    re_string='logged_in_cookie_name: \'([a-zA-Z_]+)\',? // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Cookie - secret',
    desc='To secure server cookies [alphabet string with _])',
    re_string='secret: \'([a-zA-Z_]+)\',? // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Cookie - store host',
    desc='For storing sessions [hostname or IP address])',
    re_string='host: \'([a-zA-Z_0-9.]+)\',? // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Cookie - store port',
    desc='For storing sessions [number])',
    re_string='port: \'(\d+)\',? // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Cookie - store DB number',
    desc='To secure server cookies [number])',
    re_string='db: \'(\d+)\',? // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Salt rounds',
    desc='For hashing passwords, do not change after any passwords are hashed [number, small])',
    re_string='salt_rounds: \'(\d+)\',? // configure.py: user-security'
  )

  groups.append(configure.Group(
    group_name='Client configuration',
    current_value_install_dir=current_value_install_dir,
    output_value_install_dir=output_value_install_dir,
    default_config_file_rel_path='./client/js/app/config.js'
  ))
  groups[-1].add_option(
    name='Logged in cookie name',
    desc='Cookie name set to indicate logged in (client, server config should be equal) [alphanumeric string with _])',
    re_string='logged_in_cookie_name: \'([a-zA-Z_]+)\',? // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Q.js long stack trace support',
    desc='Generate long stack traces on error in Q? [true or false]',
    re_string='q_longStackSupport: (true|false|undefined),? // configure.py: client'
  )
  groups[-1].add_option(
    name='Facebook - client id',
    desc='For application (client, server config should be equal) [a number]',
    re_string='facebook_client_id: \'(\d+)\',? // configure.py: user-facebook'
  )
  groups[-1].add_option(
    name='Google - client id',
    desc='For application (client, server config should be equal) [an alphanumeric string with - and .]',
    re_string='google_client_id: \'([a-zA-Z_.0-9]+)\',? // configure.py: user-google'
  )
  groups[-1].add_option(
    name='Twitter - consumer key',
    desc='For application (client, server config should be equal) [an alphanumeric string]',
    re_string='twitter_consumer_key: \'([a-zA-Z0-9]+)\',? // configure.py: user-twitter'
  )

  groups.append(configure.Group(
    group_name='Client logging',
    current_value_install_dir=current_value_install_dir,
    output_value_install_dir=output_value_install_dir,
    default_config_file_rel_path='./client/js/app/config.js'
  ))
  groups[-1].add_option(
    name='Client js logger',
    desc='The log level for all root/js loggers [trace, debug, info, warn, error, fatal]',
    re_string='level: \'([^\']*)\',? // configure.py: logger-js'
  )
  groups[-1].add_option(
    name='Client events_logger',
    desc='The log level for events_logger (Marionette evets) [trace, debug, info, warn, error, fatal]',
    re_string='level: \'([^\']*)\',? // configure.py: logger-events'
  )

  [group.configure_options() for group in groups]



if __name__ == '__main__':
  (current_value_install_dir, output_value_install_dir) = prompt_for_configure_directories()
  while not general.prompt_for_confirm('Is this correct?', False):
    (current_value_install_dir, output_value_install_dir) = prompt_for_configure_directories()

  print('\nYou have elected:')
  print('- to read default values from:           ' + current_value_install_dir)
  print('- to write the updated configuration to: ' + output_value_install_dir)
  if general.prompt_for_confirm('Is this correct?', None):
    print('')
    configure_app(
      current_value_install_dir=current_value_install_dir,
      output_value_install_dir=output_value_install_dir
    )
    print('')
    print('')
    print('')
    print('******************************************************************')
    print('******************************************************************')
    print('******************************************************************')
    print('                    CONFIGURATION COMPLETE')
    print('******************************************************************')
    print('******************************************************************')
    print('******************************************************************')
  else:
    print('Aborting')
