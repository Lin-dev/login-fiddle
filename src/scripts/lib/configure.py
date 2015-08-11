import os.path as path
import re

import general as general

class Input:
  '''
  Represents a single configuration value, that may be written to many places in the configuration
  '''
  def __init__(self, valkey, name, desc, current_val_filepath, current_val_regex, validation_regex):
    if path.isfile(current_val_filepath) is not True:
      raise Exception(
        'Error:\n' +
        '"' + current_val_filepath + '"" does not exist'
      )
    self.valkey = valkey
    self.name = name
    self.desc = desc
    self.current_val_filepath = current_val_filepath
    self.current_val_regex = current_val_regex
    self.validation_regex = validation_regex

  def __repr__(self):
    return repr(self.valkey) + ': name=' + repr(self.name) + ',desc=' + repr(self.desc) + ',current_val_filepath=' \
      + repr(self.current_val_filepath) + ',current_val_regex=' + repr(self.current_val_regex) + ',validation_regex=' \
      + repr(self.validation_regex)

  def get_valkey(self):
    return self.valkey

  def read_value(self):
    '''
    Loads current value as default and reads value from user, storing it in self.value and returning it to the caller
    '''
    with open(self.current_val_filepath, 'r') as current_value_file:
      current_file_as_string = current_value_file.read()
    current_value = general.value_from_file_string(
      regex_match_string=self.current_val_regex,
      file_as_string=current_file_as_string,
      file_path=self.current_val_filepath,
      name=self.name
    )
    print(self.name + ': ')
    print(self.desc)
    self.value = self.__get_value_input(current_value)
    while not re.match(self.validation_regex, self.value) or not general.prompt_for_confirm('Is this correct?', True):
      if not re.match(self.validation_regex, self.value):
        print('Error: ' + self.value + ' does not match validation regex: ' + self.validation_regex)
      self.value = self.__get_value_input(current_value)
    return self.value

  def __get_value_input(self, current_value):
    '''
    Gets a value from the user or defaults to current_value on empty string. Does not perform validation_regex check
    '''
    input_value = raw_input('Enter desired value [%s]: ' % current_value)
    if input_value == '':
      return current_value
    else:
      return input_value





class Output:
  '''
  Represents a single place a configuration value is written to, the value key used by an Output may be used by several
  '''
  def __init__(self, output_filepath, output_regex_string, input_valkey):
    if path.isfile(output_filepath) is not True:
      raise Exception(
        'Error:\n' +
        '"' + output_filepath + '"" does not exist'
      )
    self.output_filepath = output_filepath
    self.output_regex_string = output_regex_string
    self.input_valkey = input_valkey

  def __repr__(self):
    return 'output_filepath=' + repr(self.output_filepath) + ',output_regex_string=' + repr(self.output_regex_string) \
      + ',input_valkey=' + repr(self.input_valkey)

  def get_input_valkey(self):
    return self.input_valkey

  def write_output(self, value):
    with open(self.output_filepath, 'r') as output_value_file:
      output_file_as_string = output_value_file.read()
    replacement_string = re.sub(r'\([^\)]*\)', value, self.output_regex_string)
    updated_file_as_str_count_tuple = re.subn(self.output_regex_string, replacement_string, output_file_as_string)
    if updated_file_as_str_count_tuple[1] == 1:
      with open(self.output_filepath, 'w') as destination_value_file:
        destination_value_file.write(updated_file_as_str_count_tuple[0])
    else:
      raise Exception(
        'Error:\n' +
        self.name + ' was expecting just one substitution from ' + self.output_regex_string + ' in ' +
        self.output_filepath + ', but ' + updated_file_as_str_count_tuple[1] + ' were made'
      )



if __name__ == '__main__':
  print('This file is not configured to be run separately; tests will come at a later date')
