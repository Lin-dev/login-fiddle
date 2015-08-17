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
