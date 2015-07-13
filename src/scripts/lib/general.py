import os as os
import re as re
import subprocess as subprocess

def prompt_for_text(prompt='Data? ', default_string=None, validator_regexp_string='^.*$'):
  '''
  Prompts user for a response until they enter a valid value. Returns the users entered value except in the case of

  Optionally, the caller can restrict the valid values which can be returned by specifying a regexp. In many cases
  this regexp string should include the start of string and end of string anchors (^ and $, respectively).

  prompt is assumed to include a trailing space or similar for user input UX

  >>> prompt_for_text('What is your favorite colour?', 'red', '[a-zA-Z]+')
    Prints: 'Do stuff? [red] '
  >>> prompt_for_text('How old are you?', None, '\d+')
    Prints: 'How old are you? '
  '''
  if default_string is not None:
    prompt = prompt + '[' + default_string + '] '

  if validator_regexp_string is None:
    validator_regexp_string = '.*'

  while True:
    ans = raw_input(prompt).strip()
    if not ans and default_string:
      return default_string
    if not re.match(validator_regexp_string, ans):
      print '"' + ans + '" does not match allowed pattern: ' + validator_regexp_string
      continue
    return ans

def prompt_for_confirm(prompt=None, resp=None):
  '''
  prompts for yes or no response from the user. Returns True for yes and
  False for no.

 'resp' should be set to the default value assumed by the caller when
  user simply types ENTER.

  >>> prompt_for_confirm(prompt='Create directory?', resp=True)
  Create Directory? [y]|n:
  True
  >>> prompt_for_confirm(prompt='Create directory?', resp=False)
  Create Directory? y|[n]:
  False
  >>> prompt_for_confirm(prompt='Create directory?', resp=False)
  Create Directory? y|[n]: y
  True
  >>> prompt_for_confirm(prmopt='Should there be a default option?')
  Should there be a default option? y|n: n
  False

  Based on: https://code.activestate.com/recipes/541096-prompt-the-user-for-confirmation/
  '''

  if prompt is None:
    prompt = 'Confirm'

  if resp is None:
    prompt = '%s y|n: ' % prompt
  elif resp:
    prompt = '%s [y]|n: ' % prompt
  else:
    prompt = '%s y|[n]: ' % prompt

  while True:
    ans = raw_input(prompt).lower()
    if not ans and resp is not None:
      return resp
    if ans not in ['y', 'n', 'yes', 'no']:
      print 'please enter yes or no.'
      continue
    if ans == 'y' or ans == 'yes':
      return True
    if ans == 'n' or ans == 'no':
      return False



def value_from_file_string(regex_match_string, file_as_string, file_path='file', name='Property'):
  #### Check that regex_match_string matches once and once only
  if len(re.findall(regex_match_string, file_as_string)) > 1:
    raise Exception(
      'Error:\n' +
      name + ' could not be extracted because there are multiple matches for the pattern ' +
      '"' + regex_match_string + '" in ' + file_path
    )
  elif len(re.findall(regex_match_string, file_as_string)) == 0:
    raise Exception(
      'Error:\n' +
      name + ' could not be extracted because there are no matches for the pattern ' +
      '"' + regex_match_string + '" in ' + file_path
    )
  else:
    #### Extract current value
    return re.match('.*' + regex_match_string + '.*', file_as_string, re.DOTALL).group(1)



if __name__ == '__main__':
  print('This file is not configured to be run separately; tests will come at a later date')
