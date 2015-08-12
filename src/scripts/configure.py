'''
Application file configuration

Guides user through configuration file changes, writing the changes to disk. Does not move, copy, backup or otherwise
edit any files. Does not make any database changes. Does not restart the web application
'''

#!/usr/bin/python

import os.path as path
import yaml as yaml
import re as re

import lib.general as general
import lib.configure as configure

def prompt_for_configure_directories():
  current_value_install_dir = \
    general.prompt_for_text('Please enter the directory location of the currently installed app to read from: ').strip()
  output_value_install_dir = \
    general.prompt_for_text('Please enter the directory location of the currently installed app to write to:  ').strip()
  return (current_value_install_dir, output_value_install_dir)



def load_inputs_outputs(current_value_install_dir, output_value_install_dir):
  '''
  Loads inputs and outputs to be used from configure.yaml
  Outputs is a list and inputs is a dict of {valkey: Input}
  '''
  configure_yaml = open('configure.yaml', 'r')
  config_data = yaml.load(configure_yaml)
  inputs = build_input_dict(config_data['inputs'], current_value_install_dir)
  outputs = build_output_array(config_data['outputs'], inputs, output_value_install_dir)
  return (inputs, outputs)

def build_input_dict(yaml_inputs, current_value_install_dir):
  '''
  Builds a dict of valkey -> Input objects from a yaml object dict, checks no duplicate valkeys
  '''
  inputs = {}
  for ival in yaml_inputs:
    if ival['valkey'] in inputs:
      raise Exception(
        'Error:\n' +
        '"' + ival['valkey'] + '" already defined in inputs'
      )
    inputs[ival['valkey']] = configure.Input(
      valkey = ival['valkey'],
      name = ival['name'],
      desc = ival['desc'],
      current_val_filepath = current_value_install_dir + ival['current_val_rel_filepath'],
      current_val_regex = ival['current_val_regex'],
      validation_regex = ival['validation_regex']
    )
  return inputs

def build_output_array(yaml_outputs, inputs_dict, output_value_install_dir):
  '''
  Builds a list of Output objects from a yaml object dict, checks all input_valkey's exist in inputs_dict
  '''
  outputs = []
  for oval in yaml_outputs:
    check_inputs_dict_has_value_template_keys(oval['value_template'], inputs_dict)
    outputs.append(configure.Output(
      output_filepath = output_value_install_dir + oval['output_rel_filepath'],
      output_regex_string = oval['output_regex_string'],
      value_template = oval['value_template']
    ))
  return outputs

def check_inputs_dict_has_value_template_keys(value_template, inputs_dict):
  input_keys_used = re.findall('%\(([a-zA-Z_]+)\)s', value_template)
  for input_key_used in input_keys_used:
    if input_key_used not in inputs_dict:
      raise Exception(
        'Error:\n' +
        '"' + input_key_used + '" does not exist in inputs_dict'
      )



def read_inputs(inputs_dict):
  '''
  Reads inputs, returns dict of {valkey: value}
  '''
  input_values = {}
  for input in inputs_dict.values():
    input_values[input.get_valkey()] = input.read_and_return_value()
    print ''
  return input_values



def write_outputs(input_values, outputs_list):
  '''
  Iterates over [Output] outputs_list, getting the value to write from the input_values {valkey: value string} dict
  '''
  for output in outputs_list:
    output.write_output(input_values)



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
    re_string='http_port: (\d+), // configure.py: server'
  )
  groups[-1].add_option(
    name='HTTPS port',
    desc='The HTTPS port that the server listens on [number]',
    re_string='https_port: (\d+), // configure.py: server'
  )
  groups[-1].add_option(
    name='Server host',
    desc='The servers externally accessible hostname or IP address [host or IP]',
    re_string='server_host: \'([a-zA-Z_0-9.]+)\', // configure.py: server'
  )
  groups[-1].add_option(
    name='Q.js long stack trace support',
    desc='Enable long stack traces from Q [true or false]',
    re_string='q_longStackSupport: (true|false|undefined), // configure.py: server'
  )
  groups[-1].add_option(
    name='Static cache max age',
    desc='The maximum length of time a static element is cached by the server [number]',
    re_string='static_max_age: ([\d\*]+), // configure.py: server'
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
    re_string='name: \'([a-zA-Z_]*)\', // configure.py: database'
  )
  groups[-1].add_option(
    name='DB name check',
    desc='This is used by Sequelize to validate that changes are being made to the correct DB [the same as the name]',
    re_string='database_name_check_before_sync: /([a-zA-Z_]*)/, // configure.py: database'
  )
  groups[-1].add_option(
    name='DB user',
    desc='The database username [a valid string]',
    re_string='user: \'([a-zA-Z_]*)\', // configure.py: database'
  )
  groups[-1].add_option(
    name='DB user password',
    desc='The database user password [a valid string]',
    re_string='password: \'([^\n]+)\', // configure.py: database'
  )
  groups[-1].add_option(
    name='DB host',
    desc='The database host [a URI]',
    re_string='host: \'([a-zA-Z_.]*)\', // configure.py: database'
  )
  groups[-1].add_option(
    name='DB port',
    desc='The database port [a number, probably greater than 1024]',
    re_string='port: \'([\d]+)\', // configure.py: database'
  )
  groups[-1].add_option(
    name='DB schema',
    desc='The database schema to use [a valid string]',
    re_string='schema: \'([a-zA-Z_]+)\', // configure.py: database'
  )
  groups[-1].add_option(
    name='Maximum DB connections',
    desc='DB connections pool - maximum number of connections to have open [a number]',
    re_string='maxConnections: (\d+), // configure.py: database'
  )
  groups[-1].add_option(
    name='Minimum DB connections',
    desc='DB connections pool - minimum number of connections to have open [a number]',
    re_string='minConnections: (\d+), // configure.py: database'
  )
  groups[-1].add_option(
    name='Max idle time',
    desc='Maximum DB connection open idle time (in milliseconds) [a number]',
    re_string='maxIdleTime: (\d+), // configure.py: database'
  )

  groups.append(configure.Group(
    group_name='User configuration',
    current_value_install_dir=current_value_install_dir,
    output_value_install_dir=output_value_install_dir,
    default_config_file_rel_path='./server/app/config/user.js'
  ))
  groups[-1].add_option(
    name='Facebook - client id',
    desc='For application (client, server config should be equal) [a number]',
    re_string='client_id: \'(\d*)\', // configure.py: user-facebook'
  )
  groups[-1].add_option(
    name='Facebook - client secret',
    desc='For application (do not share this information or record it elsewhere) [a hex string]',
    re_string='client_secret: \'([abcdef\d]*)\', // configure.py: user-facebook'
  )
  groups[-1].add_option(
    name='Google - client id',
    desc='For application (client, server config should be equal) [an alphanumeric string with - and .]',
    re_string='client_id: \'([a-zA-Z\-_.0-9]*)\', // configure.py: user-google'
  )
  groups[-1].add_option(
    name='Google - client secret',
    desc='For application (do not share this information or record it elsewhere) [an alphanumeric string with - and .]',
    re_string='client_secret: \'([a-zA-Z\-_.0-9]*)\', // configure.py: user-google'
  )
  groups[-1].add_option(
    name='Twitter - consumer key',
    desc='For application (client, server config should be equal) [an alphanumeric string]',
    re_string='consumer_key: \'([a-zA-Z0-9.]*)\', // configure.py: user-twitter'
  )
  groups[-1].add_option(
    name='Twitter - consumer secret',
    desc='For application (do not share this information or record it elsewhere) [an alphanumeric string]',
    re_string='consumer_secret: \'([a-zA-Z0-9]*)\', // configure.py: user-twitter'
  )
  groups[-1].add_option(
    name='Logged in cookie name',
    desc='Cookie name set to indicate logged in (client, server config should be equal) [alphabet string with _])',
    re_string='logged_in_cookie_name: \'([a-zA-Z_]+)\', // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Cookie - secret',
    desc='To secure server cookies [alphabet string with _])',
    re_string='secret: \'([a-zA-Z_]+)\', // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Cookie - store host',
    desc='For storing sessions [hostname or IP address])',
    re_string='host: \'([a-zA-Z_0-9.]+)\', // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Cookie - store port',
    desc='For storing sessions [number])',
    re_string='port: \'(\d+)\', // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Cookie - store DB number',
    desc='To secure server cookies [number])',
    re_string='db: (\d+), // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Salt rounds',
    desc='For hashing passwords, do not change after any passwords are hashed [number, small])',
    re_string='salt_rounds: (\d+), // configure.py: user-security'
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
    re_string='logged_in_cookie_name: \'([a-zA-Z_]+)\', // configure.py: user-cookie'
  )
  groups[-1].add_option(
    name='Q.js long stack trace support',
    desc='Generate long stack traces on error in Q? [true or false]',
    re_string='q_longStackSupport: (true|false|undefined), // configure.py: client'
  )
  groups[-1].add_option(
    name='Facebook - client id',
    desc='For application (client, server config should be equal) [a number]',
    re_string='fb_client_id: \'(\d*)\', // configure.py: user-facebook'
  )
  groups[-1].add_option(
    name='Google - client id',
    desc='For application (client, server config should be equal) [an alphanumeric string with - and .]',
    re_string='google_client_id: \'([a-zA-Z\-_.0-9]*)\', // configure.py: user-google'
  )
  groups[-1].add_option(
    name='Twitter - consumer key',
    desc='For application (client, server config should be equal) [an alphanumeric string]',
    re_string='twitter_consumer_key: \'([a-zA-Z0-9]*)\', // configure.py: user-twitter'
  )
  groups[-1].add_option(
    name='Facebook - auth server',
    desc='Hostname or IP [host or ip]',
    re_string='fb_auth_url: \'https://([a-zA-Z_0-9.]+):27974/api/user/access/fb/auth\', // configure.py: client-oauth'
  )
  groups[-1].add_option(
    name='Facebook - reactivate server',
    desc='Hostname or IP [host or ip]',
    re_string='fb_reactivate_url: \'https://([a-zA-Z_0-9.]+):27974/api/user/reactivate/fb/auth\', // configure.py: client-oauth'
  )
  groups[-1].add_option(
    name='Facebook - connect server',
    desc='Hostname or IP [host or ip]',
    re_string='fb_connect_url: \'https://([a-zA-Z_0-9.]+):27974/api/user/connect/fb/auth\', // configure.py: client-oauth'
  )
  groups[-1].add_option(
    name='Google - auth server',
    desc='Hostname or IP [host or ip]',
    re_string='google_auth_url: \'https://([a-zA-Z_0-9.]+):27974/api/user/access/google/auth\', // configure.py: client-oauth'
  )
  groups[-1].add_option(
    name='Google - reactivate server',
    desc='Hostname or IP [host or ip]',
    re_string='google_reactivate_url: \'https://([a-zA-Z_0-9.]+):27974/api/user/reactivate/google/auth\', // configure.py: client-oauth'
  )
  groups[-1].add_option(
    name='Google - connect server',
    desc='Hostname or IP [host or ip]',
    re_string='google_connect_url: \'https://([a-zA-Z_0-9.]+):27974/api/user/connect/google/auth\', // configure.py: client-oauth'
  )
  groups[-1].add_option(
    name='Twitter - auth server',
    desc='Hostname or IP [host or ip]',
    re_string='twitter_auth_url: \'https://([a-zA-Z_0-9.]+):27974/api/user/access/twitter/auth\', // configure.py: client-oauth'
  )
  groups[-1].add_option(
    name='Twitter - reactivate server',
    desc='Hostname or IP [host or ip]',
    re_string='twitter_reactivate_url: \'https://([a-zA-Z_0-9.]+):27974/api/user/reactivate/twitter/auth\', // configure.py: client-oauth'
  )
  groups[-1].add_option(
    name='Twitter - connect server',
    desc='Hostname or IP [host or ip]',
    re_string='twitter_connect_url: \'https://([a-zA-Z_0-9.]+):27974/api/user/connect/twitter/auth\', // configure.py: client-oauth'
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
    re_string='level: \'([^\']*)\', // configure.py: logger-js'
  )
  groups[-1].add_option(
    name='Client events_logger',
    desc='The log level for events_logger (Marionette events) [trace, debug, info, warn, error, fatal]',
    re_string='level: \'([^\']*)\', // configure.py: logger-events'
  )

  '''
  groups.append(configure.Group(
    group_name='Client require.js configuration',
    current_value_install_dir=current_value_install_dir,
    output_value_install_dir=output_value_install_dir,
    default_config_file_rel_path='./client/js/main.js'
  ))
  groups[-1].add_option(
    name='Cache buster',
    desc='The (possibly dynamic) string to append to requests for server cache busting, include single quotes if nec.',
    re_string='\(([^\n]*)\), // configure.py: require-urlArgs'
  )
  '''

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
    (inputs_dict, outputs_list) = load_inputs_outputs(
      current_value_install_dir=current_value_install_dir,
      output_value_install_dir=output_value_install_dir
    )
    input_values = read_inputs(inputs_dict)
    write_outputs(input_values, outputs_list)
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
