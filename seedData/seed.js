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


function seedTiles(){
//tiles:
  var tiles = [
  //BAREFLOOR
    {identifier: 1, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
  //BAREFLOOR with 1 wall only
    {identifier: 2, edgeN: 'wall0', edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 3, edgeN: null, edgeE: 'wall0', edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 4, edgeN: null, edgeE: null, edgeS: 'wall0', edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 5, edgeN: null, edgeE: null, edgeS: null, edgeW: 'wall0', floor: 'barefloor', conveyor: null, flag: null},
  //BAREFLOOR with 2 walls only aka corner wall
    {identifier: 6, edgeN: null, edgeE: 'wall0', edgeS: 'wall0', edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 7, edgeN: null, edgeE: null, edgeS: 'wall0', edgeW: 'wall0', floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 8, edgeN: 'wall0', edgeE: null, edgeS: null, edgeW: 'wall0', floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 9, edgeN: 'wall0', edgeE: 'wall0', edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null}, 

    //SINGLE CONVEYOR with nothing else
    //straight
    {identifier: 10, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, destination: 'N'}, flag: null},
    {identifier: 11, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, destination: 'E'}, flag: null},
    {identifier: 12, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, destination: 'S'}, flag: null},
    {identifier: 13, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, destination: 'W'}, flag: null},
    //clockwise
    {identifier: 14, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 1, destination: 'S'}, flag: null}, 
    {identifier: 15, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 1, destination: 'W'}, flag: null}, 
    {identifier: 16, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 1, destination: 'N'}, flag: null}, 
    {identifier: 17, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 1, destination: 'E'}, flag: null}, 
     //counter-clockwise
    {identifier: 18, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 1, destination: 'S'}, flag: null}, 
    {identifier: 19, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 1, destination: 'W'}, flag: null}, 
    {identifier: 20, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 1, destination: 'N'}, flag: null}, 
    {identifier: 21, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 1, destination: 'E'}, flag: null}, 


  //barefloor 1 wall, 1 laser
    {edgeN: null, edgeE: 'wall1', edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},

  
  //single wrench with nothing else
    {identifier: 30, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'wrench1', conveyor: null, flag: null},
  //double wrench
    {edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'wrench2', conveyor: null, flag: null},
    {edgeN: 'wall0', edgeE: null, edgeS: null, edgeW: 'wall0', floor: 'wrench2', conveyor: null, flag: null},


  //GEARS
    {identifier: 40, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'gearCW', conveyor: null, flag: null},
    {identifier: 41, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'gearCCW', conveyor: null, flag: null},

  
  //BAREFLOOR with flag
    {identifier: 50, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: 1},
    {identifier: 51, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: 2},
    {identifier: 52, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: 3},
    {identifier: 53, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: 4},

  //PIT
    {identifier: 60, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'pit', conveyor: null, flag: null}, 

  //DOUBLE CONVERY with nothing else
  //straight
    {identifier: 70, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'N'}, flag: null},
    {identifier: 71, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'E'}, flag: null},
    {identifier: 72, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'S'}, flag: null},
    {identifier: 73, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, destination: 'W'}, flag: null},



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