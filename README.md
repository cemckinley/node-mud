# Node Mud Engine

A MUD engine, written in Node (in progress)

## Todo's

- Add global session event handler for user auth and user disconnects?
- add nodemailer function to reset password and email user
- add example server/config/env.js file to repo

## Features

- Real-time multiplayer text adventure using Socket.io to communicate between clients and server
- MongoDB for data storage
- Grunt for the development environment

## Installation

Install MongoDB: http://www.mongodb.org/ and familiarize yourself with the shell: http://docs.mongodb.org/manual/mongo/. You'll need to create a new database to use with the node mud.

Clone this repo and run `npm install .` in the root directory of the project.

Find the /server/config/env-sample.js file, replace the values with your local environment values, and rename to 'env.js'.

## Grunt tasks

- `grunt run`: Runs the socket server, http server, and starts mongodb. Watches files for changes. Changes to server files will quit and restart the server app process automatically.

## Organization

Front end files are in /client/src. Server files are in /server. The front end files are compiled by `grunt run` into /client/temp and should not be edited there. The http server runs out of the /client/temp directory, where files are copied and compiled to on change.

The http client server runs at localhost:8001. The websocket server is set to run at localhost:8002.

## Notes:

- SSL is currently only enabled for the websocket layer. When first running the project locally, you'll have to manually accept the certificate for the socket layer by visiting https://localhost:8002/socket.io/socket.io.js (this is the js file served to the client by Socket.io, and when viewed in browser will allow you to accept the SSL certificate). At some point SSL will be added to the http layer as well so you can accept it when visiting the page.

#### Dependencies

- Node
- Ruby / Compass / Sass
- MongoDB
- Socket.io
- Grunt
- Nodemailer
- bcrypt
- Oh nevermind, just check out the package.json file

# Developers

### Updating dependencies

If you want to update the projects core dependencies, make sure you update the package.json file:

    npm update --save-dev

Also, update the shrinkwrap file:
    
    npm shrinkwrap

This will guarantee that all developers have the same core node modules.
