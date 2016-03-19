'use strict';
var Promise = require('bluebird');
var path = require('path');
var chalk = require('chalk');
var Sequelize = require('sequelize');
var pg = require('pg');

// var DATABASE_URI = require(path.join(__dirname, '../env')).DATABASE_URI;

// var mongoose = require('mongoose');
// var db = mongoose.connect(DATABASE_URI).connection;

var roboDB = new Sequelize('postgres://postgres:1234@localhost:5432/robodb');




// Require our models -- these should register the model into mongoose
// so the rest of the application can simply call mongoose.model('User')
// anywhere the User model needs to be used.
require('./models');

// var startDbPromise = new Promise(function (resolve, reject) {
//     db.on('open', resolve);
//     db.on('error', reject);
// });

// console.log(chalk.yellow('Opening connection to MongoDB . . .'));
// startDbPromise.then(function () {
//     console.log(chalk.green('MongoDB connection opened!'));
// });

module.exports = roboDB.authenticate()
.then(function(){
  console.log(chalk.green('we are connecting to postgres!'));
})
.catch(function(err){
  console.error(chalk.magenta('we have a problem connecting to postgres:', err.message));
});
