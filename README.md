# LOGIN-FIDDLE

*login-fiddle is a single page web app that demonstrates authentication, sessions and data persistence*

## Introduction

login-fiddle demonstrates as many good habits for software development as I can muster. For me, I already know that it is a useful kernel that I can use as the base for bigger, fuller featured apps. First and foremost, I hope that it will be useful to others like this as well.

But ultimately, I share this humbly. It is not an example of the one Right Way (there are many) and it can definitely be improved (just see the list of issues below). The best possible outcome in my mind is a discussion through which all of us can improve our craft. So comments are welcome!

Additionally, I'd like to specially credit David Sulc - the code architecture of the client component in login-fiddle is almost completely based on his excellent Marionette books [here](https://leanpub.com/u/davidsulc) and I strongly recommend them.

## What is login-fiddle?

login-fiddle is a simple web app that integrates a Marionette single-page frontend with Node.JS and passport.js. It does not actually do anything, but demonstrates how an app with user accounts can work. Users can sign up and log in using their email address, Facebook, Google or Twitter. Client requests are automatically redirected to use HTTPS and the github repository includes self signed certificates that can be replaced with others.

Users can also connect an existing account to any of these providers, using it to log in in the future, and they can disconnect from any provider as well. Users can deactivate their account as a whole, soft deleting it, and a user who logs in to a soft-deleted account is prompted to reactivate it if they want to.

Internally, the application uses postgres and redis for data persistence. Sequelize is used as an ORM. Application constants and configuration are factored out into client and server-side configuration modules. Q is used for asynchronous code and Mocha, Should.JS and Sinon are used for server side testing. Client side testing is done using Jasmine and PhantomJS.

Linting, testing, [code provenance](https://www.npmjs.com/package/grunt-version-file) (plug!), copyright banners and building deployable archives is done with Grunt. The deployable archives can be installed, configured and updated using the included python scripts. Application activity is logged on the server and client using a custom logging framework on the client and log4js on the server. Logging can be configured in a log4j-like hierarchical manner and messages can be logged at all standard levels. The server logs can also be written to file on disk.

The application can be run in the source directory using nodemon during development. It has a pm2 configuration for production, allowing clustering, monitoring and uptime management.

## Using login-fiddle

You can't really use this - it's just a fiddle. A demo version is running [here](https://loginfiddle.mooo.com:27974).

Also see my [tech blog](https://qualocustech.wordpress.com/tag/login-fiddle/) for posts about it, including one that gives step by step instructions for deploying it to a Rackspace machine.

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
  - the install script creates a symlink that points to the installed application, by changing this symlink's destination paththe application can be upgraded easily; to roll back to an earlier code version just change what the symlink points to

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
  - Client logger configuration (and theoretically other things, but there aren't any)
  - All logs sit under `logger:root`, all events are info-logged to `logger:root:events_logger` but most logging is in `logger:root:js`

### Updating the configuration

To set configurable application settings (like the HTTP and HTTPS listener ports), run `./scripts/configure.py` and follow the instructions

### Upgrading to a later version

Run `./scripts/upgrade.py` and follow the instructions. This script assumes that the application was installed using `./scripts/install.py` and uses the symlink deployment model.

### Running login-fiddle

login-fiddle is run using pm2. To start the server, `cd` to the root directory of the install (with the `scripts`,
directory in it) and run `pm2 start scripts/pm2-config.json`. See the pm2 [documentation](https://github.com/Unitech/
pm2#table-of-contents) for other useful commands.

Alternatively, to run from source before building (e.g. for testing), `cd src` and run `nodemon server/app/server.js`

## Issues

Pull requests are very welcome. Please style code in the same manner (e.g. underscore-delimited variable names) for consistency and clarity.

login-fiddle is based on [postgres-fiddle](https://github.com/cfogelberg/postgres-fiddle) and has these issues from postgres-fiddle v0.1.2:

- Upgrading does not shut down or restart the web app if running, users must do this via pm2
  - Arguably this separation of concerns isn't an "issue", the scripts should just be more explicit they don't do it
- Testing is limited to some unit tests and a small number of commonly used client/server flags should have the same value on both client and server

It also has issues and outstanding tasks of its own:

- In client/js/main.js, urlArgs for cache busting in the require.js config must be set manually on deployment, the commented out block in configure.py does not work
- User account administration: change password and forgotten password recovery (the latter will probably require sending email)
- Using yeoman to generate base applications from login-fiddle with user accounts
- Requesting a non-API page that is also not a valid client route should display a 404 error
- The linter should enforce coding style
- The passport strategies in `server/app/util/auth/index.js` have a lot of redundant boiler plate
- Refactor the Marionette extensions in `client/js/main.js`
- After showing a view the current code requires a manual call to `AppObj.scroll_to_top()`, calling `AppObj.region_main.show(view)` should do this
- Only user ID is serialised to redis, and user data is reloaded from the DB multiple times per request - it may be more efficient to serialise the full user to redis
- On DB-dependent pages, display a loading spinner in the browser while data is being retrieved from the server
- Port the entire application to [TypeScript](http://www.typescriptlang.org/)
- Improve the configuration script code architecture - e.g. to write a single value to multiple destination locations (the current code is fragile and requires the same values be input multiple times, additionally changing the server HTTPS port from 27974 requires manual editing of OAuth URL's in client/js/app/config.js)
- Client AppObjFormItemView subclasses have to manually call AOFIV initialize to check it is being set up correctly
- Improve the client logger - logger configuration should be more like log4j and dynamically changeable, remove the logger function calls fro the stack traces
- Improve the server logger - logger configuration should be more like log4j and dynamically changeable, remove the logger function calls fro the stack traces
- HTTP to HTTPS redirects to HTTPS port even if 443 port translation is defined in iptables, instead it should redirect to https without any explicit port defined in the URL; likewise the auth callbacks redirect to the internal HTTPS port not 443
- In upgrade.py, if the value in the source configuration file is not changed then it is not copied across to the destination, even if the source and destination differ
- In upgrade.py, pm2 still points to the old symlink destination after an upgrade (`pm2 restart` does not resolve this)
- In upgrade.py, certificates are not copied across to the new install

## Changelog

- v0.0.1 - Initial stub application, identical to postgres-fiddle v0.1.2
- v1.0.0 - Initial public release under the MIT license

## License

Copyright (C) 2015 Christo Fogelberg, see the LICENSE file for details
