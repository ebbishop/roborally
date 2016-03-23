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
//tiles:
  var tiles = [
  //barefloor
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
  //pit
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'pit', conveyor: null, flag: null},
  //barefloor 1 wall
    {edgeN: 'wall0', edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {edgeN: null, edgeE: 'wall0', edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {edgeN: null, edgeE: null, edgeS: 'wall0', edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: 'wall0', floor: 'barefloor', conveyor: null, flag: null},
  //barefloor 1 wall, 1 laser
    {edgeN: null, edgeE: 'wall1', edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
  //barefloor 2 walls - corner
    {edgeN: null, edgeE: 'wall0', edgeS: 'wall0', edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {edgeN: null, edgeE: null, edgeS: 'wall0', edgeW: 'wall0', floor: 'barefloor', conveyor: null, flag: null},
    {edgeN: 'wall0', edgeE: null, edgeS: null, edgeW: 'wall0', floor: 'barefloor', conveyor: null, flag: null},
    {edgeN: 'wall0', edgeE: 'wall0', edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
  //single wrench
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'wrench1', conveyor: null, flag: null},
  //double wrench
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'wrench2', conveyor: null, flag: null},
    {edgeN: 'wall0', edgeE: null, edgeS: null, edgeW: 'wall0', floor: 'wrench2', conveyor: null, flag: null},
  //gears
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'gearCW', conveyor: null, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'gearCCW', conveyor: null, flag: null},
  //regular straight
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, destination: 'S'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, destination: 'N'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, destination: 'E'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, destination: 'W'}, flag: null},
  //express straight no walls
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'E'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'N'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'S'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'W'}, flag: null},
  //express straight 1 wall
    {edgeN: 'wall0', edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'W'}, flag: null},
    {edgeN: null, edgeE: 'wall0', edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'N'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: 'wall0', edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'E'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: 'wall0', floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'S'}, flag: null},
  //express clockwise
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 2, destination: 'E'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 2, destination: 'S'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 2, destination: 'W'}, flag: null},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 2, destination: 'N'}, flag: null},
  //flags
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: 1},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: 2},
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: 3},
  ];
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
