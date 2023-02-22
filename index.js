'use strict';

require('dotenv').config();
const {start} = require('./src/server');

// Start up DB Server
const { db } = require('./src/auth/models/index.js');

db.sync()
  .then(() => {
    // Start the web server
    start();
  })
  .catch(e => console.error(e));

