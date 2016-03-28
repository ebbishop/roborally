var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('../server/db');

var User = Promise.promisifyAll(mongoose.model('User'));
var Tile = Promise.promisifyAll(mongoose.model('Tile'));
var Board = Promise.promisifyAll(mongoose.model('Board'));
var Player = Promise.promisifyAll(mongoose.model('Player'));
var Game = Promise.promisifyAll(mongoose.model('Game'));

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
  console.log('seed tiles')
  return tiles.map(function(tile){
    return new Tile(tile);
  })
}

function connectTileToBoard(){
  tiles = seedTiles()
  tiles.forEach(function(tile){
    boards.forEach(function(b){
      var keys = Object.keys(b)
      keys.forEach(function(col){
        if (col !== 'dockLocations' && col !== 'name' && col !== 'thumbnail'){
          b[col] = b[col].map(function(tIdentifier, index){
            if (tile.identifier === tIdentifier){
              b[col][index] = tile._id;
            }
            return b[col][index];
          })
        }
      })
    })
  })
}

function connectGameToBoard() {
  boards = seedBoards()
  boards.forEach(function(b){
    games.forEach(function(g){
      var keys = Object.keys(g)
      keys.forEach(function(k){
        if(k === 'board' && g[k] === b.name) {
          g[k] = b._id;
          console.log(g[k])
        }
      })
    })
  })
}

function seedBoards(){
  return boards.map(function(board){
    return new Board(board);
  });
}

function seedGames() {
  return games.map(function(game){
    return new Game(game)
  })
}

function generateAll() {
  connectTileToBoard();
  connectGameToBoard();
  var seededGames = seedGames()
  return tiles.concat(boards).concat(seededGames);
}

function seedAll() {
  var docs = generateAll();
  return Promise.map(docs, function(doc){
    return doc.save();
  })
}

connectToDb
.then(function() {
  return Promise.all([
    Board.remove({}), 
    Tile.remove({})
  ])
})
.then(function(){
  return seedAll(); 
})
.then(function () {
  console.log(chalk.green('Seed successful!'));
  process.kill(0);
})
.catch(function (err) {
  console.error(err);
  process.kill(1);
});


/******SEED********/
var games = [
  //risky exchange
  {name: 'testGameA', board: "Risky Exchange", active: false, numFlags: 3, inProgress: false, isWon: true},
  //chopshop challenge
  {name: 'testGameB', board: "Chop Shop Challenge", active: true, state: 'decision', numFlags: 4, inProgress: true, isWon: false}
]

//docks: 
var dock1 = [[15,5], [15,6], [14,3], [14,8], [13,1], [13,10], [12,0], [12,11]];
var dock2 = [[14, 5], [14, 6], [14, 3], [14, 8], [14, 1], [14, 10], [14, 0], [14, 11]];
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
    {identifier: 10, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, bearing: [-1, 0, 'N']}, flag: null},
    {identifier: 11, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, bearing: [0, 1, 'E']}, flag: null},
    {identifier: 12, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, bearing: [1, 0, 'S']}, flag: null},
    {identifier: 13, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 1, bearing: [0, -1, 'W']}, flag: null},
    //clockwise
    {identifier: 14, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 1, bearing: [1, 0, 'S']}, flag: null}, 
    {identifier: 15, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 1, bearing: [0, -1, 'W']}, flag: null}, 
    {identifier: 16, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 1, bearing: [-1, 0, 'N']}, flag: null}, 
    {identifier: 17, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 1, bearing: [0, 1, 'E']}, flag: null}, 
     //counter-clockwise
    {identifier: 18, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 1, bearing: [1, 0, 'S']}, flag: null}, 
    {identifier: 19, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 1, bearing: [0, -1, 'W']}, flag: null}, 
    {identifier: 20, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 1, bearing: [-1, 0, 'N']}, flag: null}, 
    {identifier: 21, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 1, bearing: [0, 1, 'E']}, flag: null}, 

    //counter-clockwise and 1 wall
    {identifier: 22, edgeN: 'wall0', edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 1, bearing: [0, -1, 'W']}, flag: null},

  
  //single wrench with nothing else
    {identifier: 30, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'wrench1', conveyor: null, flag: null},
    //single wrench with east wall
    {identifier: 31, edgeN: null, edgeE: 'wall0', edgeS: null, edgeW: null, floor: 'wrench1', conveyor: null, flag: null},

  //double wrench
    {identifier: 36, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: 'wrench2', conveyor: null, flag: null},
    //double wrench with north wall and west wall
    {identifier: 37, edgeN: 'wall0', edgeE: null, edgeS: null, edgeW: 'wall0', floor: 'wrench2', conveyor: null, flag: null},


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

  //DOUBLE CONVEYOR with nothing else
  //straight
    {identifier: 70, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, bearing: [-1, 0, 'N']}, flag: null},
    {identifier: 71, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, bearing: [0, 1, 'E']}, flag: null},
    {identifier: 72, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, bearing: [1, 0, 'S']}, flag: null},
    {identifier: 73, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, bearing: [0, -1, 'W']}, flag: null},
  //double clockwise
    {identifier: 74, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 2, bearing: [-1, 0, 'N']}, flag: null},
    {identifier: 75, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 2, bearing: [0, 1, 'E']}, flag: null},
    {identifier: 76, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 2, bearing: [1, 0, 'S']}, flag: null},
    {identifier: 77, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'clockwise', magnitude: 2, bearing: [0, -1, 'W']}, flag: null},
  //double counterclockwise
    {identifier: 78, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 2, bearing: [-1, 0, 'N']}, flag: null},
    {identifier: 79, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 2, bearing: [0, 1, 'E']}, flag: null},
    {identifier: 80, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 2, bearing: [1, 0, 'S']}, flag: null},
    {identifier: 81, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'counterclock', magnitude: 2, bearing: [0, -1, 'W']}, flag: null},

  //DOUBLE CONVEYOR with one wall 
  //straight
    {identifier: 82, edgeN: null, edgeE: 'wall0', edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, bearing: [-1, 0, 'N']}, flag: null},
    {identifier: 83, edgeN: null, edgeE: null, edgeS: 'wall0', edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, bearing: [0, 1, 'E']}, flag: null},
    {identifier: 84, edgeN: null, edgeE: null, edgeS: null, edgeW: 'wall0', floor: null, conveyor: {type: 'straight', magnitude: 2, bearing: [1, 0, 'S']}, flag: null},
    {identifier: 85, edgeN: 'wall0', edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, bearing: [0, -1, 'W']}, flag: null},
    {identifier: 86, edgeN: null, edgeE: null, edgeS: 'wall0', edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, bearing: [0, -1, 'W']}, flag: null},

  //DOUBLE CONVEYOR MERGES 
    {identifier: 87, edgeN: null, edgeE: null, edgeS: null, edgeW: null, floor: null, conveyor: {type: 'merge2', magnitude: 2, bearing: [0, 1, 'E']}, flag: null},

  //DOUBLE CONVEYOR 1 LASER
    {identifier: 88, edgeN: null, edgeE: null, edgeS: 'wall1', edgeW: null, floor: null, conveyor: {type: 'straight', magnitude: 2, bearing: [0, -1, 'W']}, flag: null},  

  //barefloor 1 wall, 1 laser
    {identifier: 90, edgeN: 'wall1', edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 91, edgeN: null, edgeE: 'wall1', edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 92, edgeN: null, edgeE: null, edgeS: 'wall1', edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 93, edgeN: null, edgeE: null, edgeS: null, edgeW: 'wall1', floor: 'barefloor', conveyor: null, flag: null},
  //barefloor 1 wall 2 lasers
    {identifier: 94, edgeN: 'wall2', edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 95, edgeN: null, edgeE: 'wall2', edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 96, edgeN: null, edgeE: null, edgeS: 'wall2', edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 97, edgeN: null, edgeE: null, edgeS: null, edgeW: 'wall2', floor: 'barefloor', conveyor: null, flag: null},
  //barefloor 1 wall 3 lasers
    {identifier: 98, edgeN: 'wall3', edgeE: null, edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 99, edgeN: null, edgeE: 'wall3', edgeS: null, edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 100, edgeN: null, edgeE: null, edgeS: 'wall3', edgeW: null, floor: 'barefloor', conveyor: null, flag: null},
    {identifier: 101, edgeN: null, edgeE: null, edgeS: null, edgeW: 'wall3', floor: 'barefloor', conveyor: null, flag: null},

  ];

var boards = [
  {
    name: 'Risky Exchange',
    col0: [30, 13, 5, 11, 5, 13, 1, 5, 13, 5, 60, 1, 1, 1, 11, 1],
    col1: [1, 1, 1, 11, 52, 13, 11, 1, 13, 1, 4, 1, 1, 5, 11, 1],
    col2: [2, 60, 1, 11, 1, 13, 11, 1, 13, 1, 1, 4, 2, 5, 14, 21],
    col3: [10, 10, 10, 41, 1, 13, 11, 1, 41, 10, 10, 10, 1, 1, 1, 11],
    col4: [2, 1, 1, 1, 6, 13, 11, 9, 1, 1, 1, 4, 8, 1, 1, 11],
    col5: [12, 12, 12, 12, 12, 1, 1, 72, 72, 72, 72, 72, 1, 1, 1, 1],
    col6: [10, 10, 10, 10, 10, 1, 1, 10, 10, 10, 10, 1, 1, 1, 5, 5], 
    col7: [2, 50, 1, 1, 7, 13, 71, 37, 1, 1, 1, 4, 9, 1, 1, 13],
    col8: [12, 12, 12, 12, 1, 13, 71, 1, 41, 12, 12, 12, 1, 1, 1, 13],
    col9: [2, 1, 5, 71, 1, 13, 71, 51, 13, 1, 1, 4, 2, 3, 18, 15],
    col10: [10, 40, 1, 71, 1, 13, 71, 1, 13, 2, 40, 10, 1, 3, 13, 1],
    col11: [1, 13, 91, 71, 3, 13, 71, 3, 13, 3, 11, 30, 1, 1, 13, 1],
    dockLocations: dock1,
    laserLocations: [[[2, 0], [2, 3], 1, 'v']],
    thumbnail: '/img/thumbnails/riskyexchange.png'
  },
  {
    name: 'Checkmate',
    col0: [1, 1, 5, 1, 5, 1, 1, 5, 1, 5, 1, 30, 1, 1, 1, 1],
    col1: [1, 75, 70, 82, 70, 82, 82, 70, 82, 70, 74, 1, 1, 1, 5, 1],
    col2: [2, 71, 11, 5, 11, 5, 11, 5, 11, 5, 73, 4, 2, 1, 1, 4],
    col3: [1, 83, 1, 60, 1, 11, 1, 11, 51, 11, 85, 1, 1, 1, 5, 1],
    col4: [2, 71, 11, 1, 11, 1, 11, 1, 11, 1, 73, 4, 2, 1, 1, 4],
    col5: [1, 83, 2, 11, 1, 36, 1, 60, 1, 11, 85, 1, 1, 1, 5, 1],
    col6: [1, 83, 13, 1, 60, 1, 36, 1, 13, 1, 85, 1, 1, 1, 5, 1],
    col7: [2, 71, 50, 13, 1, 13, 1, 13, 1, 13, 73, 3, 2, 1, 5, 4],
    col8: [1, 83, 13, 1, 13, 1, 60, 1, 13, 1, 85, 1, 1, 1, 1, 1],
    col9: [2, 71, 1, 13, 1, 13, 1, 13, 1, 13, 73, 4, 2, 1, 5, 4],
    col10: [1, 76, 72, 84, 72, 84, 84, 72, 84, 72, 77, 1, 1, 1, 1, 1],
    col11: [30, 1, 3, 1, 3, 1, 1, 3, 1, 3, 1, 1, 1, 1, 5, 1],
    dockLocations: dock2
  },
  {
    name: 'Chop Shop Challenge',
    col0: [1, 13, 5, 11, 5, 1, 1, 5, 13, 5, 1, 30, 1, 1, 1, 1],
    col1: [4, 100, 1, 11, 1, 1, 1, 90, 13, 1, 52, 2, 1, 1, 5, 1],
    col2: [2, 13, 36, 11, 1, 60, 1, 1, 13, 60, 1, 1, 2, 1, 1, 4], 
    col3: [1, 13, 4, 1, 40, 41, 96, 1, 41, 10, 10, 10, 1, 1, 5, 1], 
    col4: [2, 13, 93, 71, 1, 1, 13, 1, 1, 50, 1, 4, 2, 1, 1, 4],
    col5: [12, 15, 41, 71, 1, 1, 13, 60, 93, 1, 5, 1, 1, 1, 5, 1],
    col6: [10, 10, 40, 71, 1, 36, 22, 10, 40, 10, 10, 10, 1, 1, 5, 1],
    col7: [2, 1, 1, 71, 1, 12, 41, 1, 3, 36, 1, 4, 2, 1, 5, 4],
    col8: [1, 1, 1, 71, 1, 8, 11, 1, 1, 60, 1, 1, 1, 1, 1, 1],
    col9: [2, 1, 3, 87, 70, 74, 11, 1, 13, 13, 1, 51, 2, 1, 5, 4],
    col10: [1, 60, 4, 71, 1, 88, 11, 1, 13, 19, 10, 10, 1, 1, 1, 1],
    col11: [30, 1, 3, 71, 3, 73, 11, 53, 13, 3, 1, 1, 1, 1, 5, 1],
    dockLocations: dock2,
    laserLocations: [[[2, 10], [1, 10], 3, 'h'], [[2, 8], [2, 2], 1, 'v']],
    thumbnail: '/img/thumbnails/chopshop.png'
  }  
];

