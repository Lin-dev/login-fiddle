'''
Upgrades an existing application, reading from the current configuration and writing to the new one

After prompting for the application directory symlink (e.g. /opt/login-fiddle/app), this script guides the user
through any configuration changes and updates the symlink to point to the install location that this script is in. Does
not make any changes to the database. Does not restart the webservers.

Assumptions:
- That the application has been installed using install.py
'''

#!/usr/bin/python

import os as os

import lib.general as general
import configure as configure

def prompt_for_upgrade_directories():
  install_dir_path = general.prompt_for_text('Enter the upgraded application install directory path: ').strip()
  app_symlink_path = general.prompt_for_text('Enter the application symlink path:                    ').strip()
  return (install_dir_path, app_symlink_path)



def update_symlink(symlink_path, target_path):
  '''
  Updates the symlink that is at symlink_path to point to target_path
  Raises errors if either the symlink_path or target_path do not exist
  '''
  if not os.path.exists(target_path):
    raise Exception(
      'Error:\n' +
      'Could not update symlink - target path "' + target_path + '" does not exist'
    )
  if os.path.lexists(symlink_path) and os.path.islink(symlink_path):
    os.unlink(symlink_path)
  else:
    raise Exception(
      'Error:\n' +
      'Could not update symlink - symlink path "' + symlink + '" does not exist or is not a symlink'
    )
  os.symlink(target_path, symlink_path)



def upgrade_app(install_dir_path, app_symlink_path):
  '''
  Migrates the application's configuration and updates the application symlink.
  '''
  configure.configure_app(
    current_value_install_dir=app_symlink_path,
    output_value_install_dir=install_dir_path
  )

  update_symlink(
    symlink_path=app_symlink_path,
    target_path=install_dir_path
  )



if __name__ == '__main__':
  print('NB: Usually the upgraded application install directory is the parent of directory of this script')
  (install_dir_path, app_symlink_path) = prompt_for_install_directories()
  while not general.prompt_for_confirm('Is this correct?'):
    (install_dir_path, app_symlink_path) = prompt_for_install_directories()

  print('\nYou have entered:')
  print('- upgraded application install directory path: ' + install_dir_path)
  print('- application symlink path:                    ' + app_symlink_path)
  if general.prompt_for_confirm('Is this correct?'):
    print('')
    upgrade_app(
      install_dir_path=install_dir_path,
      app_symlink_path=app_symlink_path
    )
    print('')
    print('')
    print('')
    print('******************************************************************')
    print('******************************************************************')
    print('******************************************************************')
    print('                        UPGRADE COMPLETE')
    print('******************************************************************')
    print('******************************************************************')
    print('******************************************************************')
  else:
    print('Aborting')
