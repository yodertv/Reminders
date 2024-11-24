// static.js
const path = require('path');
const express = require("express");

const app = express();

// Serve static files from the "static" directory
console.log("Launching express.static()")
app.use(express.static(path.join(__dirname, '../public')));

// Export the app
module.exports = app;
