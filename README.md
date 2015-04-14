# LOGIN-FIDDLE

This fiddle app demonstrates a Node.JS web app that uses passport.js

## Using login-fiddle

You can't really use this. It's just a fiddle.

## Bumping, building and testing login-fiddle

Build login-fiddle using Grunt. A deployable archive is created in the `build/dist`
directory by the build task.

Command                     | Notes
----------------------------|---------------------------------------------------------------------
grunt clean                 | Removes the `build` directory and other temporary files
grunt test                  | Runs jshint (client, server) and mocha (server) tests
grunt build                 | Cleans, tests and builds application ready for deployment

## Deploying login-fiddle

login-fiddle requires Node = 0.11.x, pm2 >= 0.12 and postgres >= 9.1.

### Installation

1. Copy the distribution archive to the location of choice and extract it.
2. Run `./scripts/install.py` and follow the instructions
3. Follow the instructions
  - for easy upgrades the install script creates a symlink that should be use to refer to the current install

NB: These installation steps assume that Postgres is running at the time of installation.

### Updating the configuration

Run `./scripts/configure.py` and follow the instructions

### Upgrading to a later version

Run `./scripts/upgrade.py` and follow the instructions

### Manual configuration

If preferred, login-fiddle can also be configured by manually editing various files. They are as follows:

- server/app/util/logger/logger_config.json
  - Server logger configuration (appenders, dest groups and log levels by logger)
  - NB: Everything sits under `logger:app`
- server/app/config/server.js
  - Server http_port, q_longStackSupport status (true/false) and the length of time to cache static assets
- server/app/config/database.js
  - Database connection information and schema name
- server/app/config/logger.js
  - The log4js Express logger log string format and definitions of any custom tokens in that string
- client/js/app/config.js
  - Client logger configuration (and theoretically other things, but there aren't any)
  - All logs sit under `logger:root`, most logging is in `logger:root:js` but all events are info-logged to `
    logger:root:events_logger`

## Running login-fiddle

login-fiddle is run using pm2. To start the server, `cd` to the root directory of the install (with the `scripts`,
directory in it) and run `pm2 start scripts/pm2-config.json`. See the pm2 [documentation](https://github.com/Unitech/
pm2#table-of-contents) for other useful commands.

Alternatively, to run from source before building (e.g. for testing), `cd src` and run `nodemon server/app/server.js`

## Nice features

login-fiddle is based on postgres-fiddle v0.1.1 so it has some good stuff from that. It also has:

- nothing

## Issues

login-fiddle has these issues from postgres-fiddle v0.1.1:
- Upgrading does not shut down or restart the web app if running, users must do this via pm2
  - Arguably this separation of concerns isn't an "issue", the scripts should just be more explicit they don't do it
- There is no client testing implemented

It also has these issues of its own:
- nothing

## Changelog

vX.X.X

## License

Copyright (C) 2015 Christo Fogelberg, all rights reserved
