# Node Mud Engine

A MUD engine, written in Node (in progress)

## Features

- Real-time multiplayer text adventure using Socket.io to communicate between clients and server
- MongoDB for data storage
- Grunt for the development environment

## Installation

Requires ruby (>=2.0.0) and compass (>=0.12.2): http://compass-style.org/install/

Requires node (>=0.10.18): http://nodejs.org/

Requires grunt (>=0.4.4): http://gruntjs.com/getting-started

Install MongoDB: http://www.mongodb.org/ and familiarize yourself with the shell: http://docs.mongodb.org/manual/mongo/. Optional, install the MongoHub GUI to manage your db: https://code.google.com/p/mongohub/.

Clone this repo and run `npm install .` in the root directory of the project.

Find the /server/config/env-sample.js file, replace the values with your local environment values, and rename to 'env.js'.

## Grunt tasks

- `grunt run`: Runs the socket server, http server, and starts mongodb. Watches files for changes. Changes to server files will quit and restart the server app process automatically.

## Organization

Front end files are in **/client/src**. Server files are in **/server**. The front end files are compiled by `grunt run` into /client/temp and should not be edited there. The http server runs out of the /client/temp directory, where files are copied and compiled to on change.

The https client server runs at `https://localhost:8001`. The websocket server is set to run at `localhost:8002`.

## Dependencies

Some core dependencies include: 

- Node
- Ruby / Compass / Sass
- Grunt
- MongoDB

Check the package.json file for a list of node module dependencies.

### Updating dependencies

If you want to update the projects core dependencies, make sure you update the package.json file:

    npm update --save-dev

Also, update the shrinkwrap file:
    
    npm shrinkwrap

This will guarantee that all developers have the same core node modules.

## Git flow

We're using the [git flow](http://nvie.com/posts/a-successful-git-branching-model/) methodology on this project.