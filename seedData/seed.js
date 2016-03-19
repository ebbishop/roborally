var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');

var User = Promise.promisifyAll(mongoose.model('User'));
var Conveyor = Promise.promisifyAll(mongoose.model('Conveyor'));
var Card = Promise.promisifyAll(mongoose.model('Card'));

var seedUsers = function () {
    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    return User.createAsync(users);

};

function seedConveyors () {
  var conveyors = [
    { type: 'straight', magnitude: 1, destination: 'N' },
    { type: 'straight', magnitude: 1, destination: 'S' },
    { type: 'straight', magnitude: 1, destination: 'E' },
    { type: 'straight', magnitude: 1, destination: 'W' },
    { type: 'straight', magnitude: 2, destination: 'N' },
    { type: 'straight', magnitude: 2, destination: 'S' },
    { type: 'straight', magnitude: 2, destination: 'E' },
    { type: 'straight', magnitude: 2, destination: 'W' },
    { type: 'clockwise', magnitude: 1, destination: 'N' },
    { type: 'clockwise', magnitude: 1, destination: 'S' },
    { type: 'clockwise', magnitude: 1, destination: 'E' },
    { type: 'clockwise', magnitude: 1, destination: 'W' },
    { type: 'clockwise', magnitude: 2, destination: 'N' },
    { type: 'clockwise', magnitude: 2, destination: 'S' },
    { type: 'clockwise', magnitude: 2, destination: 'E' },
    { type: 'clockwise', magnitude: 2, destination: 'W' },
    { type: 'counterclock', magnitude: 1, destination: 'N' },
    { type: 'counterclock', magnitude: 1, destination: 'S' },
    { type: 'counterclock', magnitude: 1, destination: 'E' },
    { type: 'counterclock', magnitude: 1, destination: 'W' },
    { type: 'counterclock', magnitude: 2, destination: 'N' },
    { type: 'counterclock', magnitude: 2, destination: 'S' },
    { type: 'counterclock', magnitude: 2, destination: 'E' },
    { type: 'counterclock', magnitude: 2, destination: 'W' },
    { type: 'merge1left', magnitude: 1, destination: 'N' },
    { type: 'merge1left', magnitude: 1, destination: 'S' },
    { type: 'merge1left', magnitude: 1, destination: 'E' },
    { type: 'merge1left', magnitude: 1, destination: 'W' },
    { type: 'merge1left', magnitude: 2, destination: 'N' },
    { type: 'merge1left', magnitude: 2, destination: 'S' },
    { type: 'merge1left', magnitude: 2, destination: 'E' },
    { type: 'merge1left', magnitude: 2, destination: 'W' },
    { type: 'merge1right', magnitude: 1, destination: 'N' },
    { type: 'merge1right', magnitude: 1, destination: 'S' },
    { type: 'merge1right', magnitude: 1, destination: 'E' },
    { type: 'merge1right', magnitude: 1, destination: 'W' },
    { type: 'merge1right', magnitude: 2, destination: 'N' },
    { type: 'merge1right', magnitude: 2, destination: 'S' },
    { type: 'merge1right', magnitude: 2, destination: 'E' },
    { type: 'merge1right', magnitude: 2, destination: 'W' },
    { type: 'merge2', magnitude: 1, destination: 'N' },
    { type: 'merge2', magnitude: 1, destination: 'S' },
    { type: 'merge2', magnitude: 1, destination: 'E' },
    { type: 'merge2', magnitude: 1, destination: 'W' },
    { type: 'merge2', magnitude: 2, destination: 'N' },
    { type: 'merge2', magnitude: 2, destination: 'S' },
    { type: 'merge2', magnitude: 2, destination: 'E' },
    { type: 'merge2', magnitude: 2, destination: 'W' },
  ];

  return Conveyor.createAsync(conveyors);
}

function seedTiles(){

}

function seedBoards(){

}

function seedAll(){

}

connectToDb.then(function () {
  User.findAsync({})
  .then(function (users) {
    if (users.length === 0) {
      return seedAll();
    } else {
      console.log(chalk.magenta('Seems to already be user data, exiting!'));
      process.kill(0);
    }
  }).then(function () {
    console.log(chalk.green('Seed successful!'));
    process.kill(0);
  }).catch(function (err) {
    console.error(err);
    process.kill(1);
  });
});
