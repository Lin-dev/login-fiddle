# LOGIN-FIDDLE

*login-fiddle is a single page web app that demonstrates authentication, sessions and data persistence*

## Introduction

Welcome to login-fiddle. As well as showing one way to implement these features to a release-ready, industry-grade level, this web app is also an attempt to showcase as many good software development habits as I can muster. It is released under the MIT license and I hope that it will be useful to others as an example and as code they can freely use.

With special thanks to David Sulc, the code architecture of the client component in login-fiddle is based on his excellent Marionette books [here](https://leanpub.com/u/davidsulc). If you'd like to learn more about Marionette I recommend these books.

## What is login-fiddle?

login-fiddle is a simple web app that integrates a Marionette single-page frontend with Node.JS and passport.js. It demonstrates how an app with user accounts can work. Users can sign up and log in using their email address, Facebook, Google or Twitter. Client requests are automatically redirected to use HTTPS and the github repository includes self signed certificates that can be replaced with others.

Users can also connect an existing account to any of these providers, using it to log in in the future, and they can disconnect from any provider as well. Users can deactivate their account as a whole, soft deleting it, and a user who logs in to a soft-deleted account is prompted to reactivate it if they want to.

Internally, the application uses postgres and redis for data persistence. Sequelize is used as an ORM. Application constants and configuration are factored out into client and server-side configuration modules. Q is used for asynchronous code and Mocha, Should.JS and Sinon are used for server side testing. Client side testing is done using Jasmine and PhantomJS.

Linting, testing, [code provenance](https://www.npmjs.com/package/grunt-version-file) (plug!), copyright banners and building deployable archives is done with Grunt. The deployable archives can be installed, configured and updated using the included python scripts. Application activity is logged on the server and client using a custom logging framework on the client and log4js on the server. Logging can be configured in a log4j-like hierarchical manner and messages can be logged at all standard levels. The server logs can also be written to file on disk.

The application can be run in the source directory using nodemon during development. It has a pm2 configuration for production, allowing clustering, monitoring and uptime management.

## Using login-fiddle

Apart from logging in and out there isn't much to use, this is just a fiddle app. A demo version is running [here](https://loginfiddle.mooo.com:27974).

Also see my [tech blog](https://qualocustech.wordpress.com/tag/login-fiddle/) for posts about it, including one that gives step by step instructions for deploying it to a Rackspace server.

## Testing and building login-fiddle

Test and build login-fiddle using Grunt. A deployable archive is created in the `build/dist` directory by the build task.

Command                     | Notes
----------------------------|---------------------------------------------------------------------
grunt clean                 | Removes the `build` directory and other temporary files
grunt test                  | Lints and tests the client and server code
grunt build                 | Cleans, tests and builds the application, ready for deployment

## Deploying and running login-fiddle

login-fiddle requires Node = 0.11.x, pm2 >= 0.12 and postgres >= 9.1.

### Installation and configuration

1. Copy the distribution archive to the location of choice and extract it.
2. Run `./scripts/install.py`
3. Follow the instructions
  - the install script creates a symlink that points to the installed application, by changing this symlink's destination path the application can be upgraded easily; to roll back to an earlier code version just change what the symlink points to

These installation steps assume that Postgres is running at the time of installation.

### Manual configuration

login-fiddle can also be configured by manually editing various files. They are as follows:

- `server/app/util/logger/logger_config.json`
  - Detailed server logger configuration (appenders, dest groups and log levels by logger)
  - NB: Everything sits under `logger:app`
- `server/app/config/server.js`
  - Server http_port, q_longStackSupport status (true/false), the length of time to cache static assets etc.
- `server/app/config/database.js`
  - Database connection information and schema name
- `server/app/config/logger.js`
  - The log4js Express logger log string format and definitions of any custom tokens in that string
- `server/app/config/user.js`
  - User configuration, session configuration and external auth provider configuration
- `client/js/app/config.js`
  - Client logger and other client configuration
  - All logs sit under `logger:root`, all events are info-logged to `logger:root:events_logger` but most logging is in `logger:root:js`

### Updating the configuration

To set configurable application settings (like the HTTP and HTTPS listener ports), run `./scripts/configure.py` and follow the instructions

### Upgrading to a later version

Run `./scripts/upgrade.py` and follow the instructions. This script assumes that the application was installed using `./scripts/install.py` and uses the symlink deployment model. Note that the upgrade script cannot be used if there are
persistence layer schema changes between the deployed and upgraded version.

### Running login-fiddle

login-fiddle is run using pm2. To start the server, `cd` to the root directory of the install (with the `scripts`,
directory in it) and run `pm2 start scripts/pm2-config.json`. See the pm2 [documentation](https://github.com/Unitech/
pm2#table-of-contents) for other useful commands.

Alternatively, to run from source before building (e.g. for testing), `cd src` and run `nodemon server/app/server.js`

## Issues

Pull requests are very welcome. Please style code in the same manner (e.g. underscore-delimited variable names) for consistency and clarity.

login-fiddle is based on  and has a couple of issues from [postgres-fiddle](https://github.com/cfogelberg/postgres-fiddle) v0.1.2, it also has issues and outstanding tasks of its own:

- General
  - The linter should enforce coding style
  - Port the entire application to [TypeScript](http://www.typescriptlang.org/)
- Client
  - Client AppObjFormItemView subclasses have to manually call AOFIV initialize to check it is being set up correctly
  - Requesting a non-API page that is also not a valid client route should display a 404 error
  - On DB-dependent pages, display a loading spinner in the browser while data is being retrieved from the server
  - Application controller codebase is repetitive in places - refactor and tidy up
  - Define the `Common.Entities` module only once
  - Local account forgotten password recovery
    - Probably requires email sending implementation
- Logging
  - Improve the client logger - move it to its own module, logger configuration should be more like log4j and dynamically changeable, remove the logger function calls fro the stack traces
  - Improve the server logger - logger configuration should be more like log4j and dynamically changeable, remove the logger function calls fro the stack traces
- Testing
  - From postgres-fiddle 0.1.2: Tests are quite limited in scope, more would be better
  - Tests require OAuth provider client ID/key and secret etc to be defined in the config files
- Scripts
  - upgrade.py - pm2 uses the old symlink target after upgrade, it should point to the new target
  - upgrade.py - from postgres-fiddle 0.1.2, upgrading does not shut down or restart the web app if running, users must do this via pm2
    - Arguably this separation of concerns isn't an "issue", the scripts should just be more explicit they don't do it
  - upgrade.py - certificates are not copied across to the new install
  - upgrade.py - allow schema changes
  - configure.py - value_template for urlArgs adds an extra pair of brackets
  - configure.py - configuration file inputs are requested from user in random (dictionary traversal) order, they should be ordered
  - all - make them working directory neutral for execution
  - Use yeoman to generate base apps with auth, profiles, user accounts etc from login-fiddle

## Changelog

- v0.0.1 - Initial stub application, identical to postgres-fiddle v0.1.2
- v1.0.0 - Initial public release under the MIT license
- v1.0.1 - Misc minor bug fixes
- v1.1.0 - Rate limited logins, password changing features, easier to use scripts and backend server code clean up

## License

Copyright (C) 2015 Christo Fogelberg, see the LICENSE file for details
