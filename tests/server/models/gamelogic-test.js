var dbURI = 'mongodb://localhost:27017/roborally';
// var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var Promise = require('bluebird');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
// Require in all models.
require('../../../server/db/models');
// var seed = require('../../../seedData/seed.js');

var Player = mongoose.model('Player');
var Game = mongoose.model('Game');
var Board = mongoose.model('Board');
var Tile = mongoose.model('Tile');

describe ('Game Logic', function() {
  beforeEach('Establish DB connection', function (done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  // afterEach('Clear test database', function (done) {
  //   clearDB(done);
  // });

  describe('Create game', function(){
    var board;
    beforeEach('Get a board', function(done){
      console.log('beforeEach 1')
      Board.findOne({name: 'Risky Exchange'})
      .then(function(b){
        board = b;
        done()
      })
      .then(null, done)
    })
    var game = new Game({});
    var player1 = new Player({
      name: 'emma',
      robot: 'Squash Bot',
      dock: [15,5],
      position: [15,5]
    });
    var player2 = new Player({
      name: 'jisoo',
      robot: 'Twitch',
      dock: [15,6],
      position: [15,6]
    });
    var player3 = new Player({
      name: 'priti',
      robot: 'Hulk x90',
      dock: [14,3],
      position: [14,3]
    })
    beforeEach(function(){
      console.log('beforeEach2');
      game.players.push(player1, player2, player3);
      game.set('board', board);
    })
    beforeEach(function(done){
      console.log('beforeEach3');
      Promise.all([game.save(), player1.save(), player2.save(), player3.save()])
      .then(function(){
        done();
      })
      .then(null, done)
    })
    beforeEach(function(done){
      console.log('beforeEach4', game._id);
      Game.findById(game._id)
      .deepPopulate(['board.col0', 'board.col1', 'board.col2', 'board.col3', 'board.col4',
        'board.col5', 'board.col6', 'board.col7', 'board.col8', 'board.col9', 'board.col10',
        'board.col11', 'players.player'])
      .then(function(g){
        console.log(g.players)
        done()
      })
      .then(null, done)
    })

    // afterEach(function(done){
    //   Promise.all([
    //     Game.remove({}),
    //     Player.remove({})
    //   ])
    //   .then(function(){
    //     done();
    //   })
    //   .then(null, done)
    // })

    it('should have players', function(){
      expect(game.players.length).to.equal(3);
      console.log(game.players);
      // expect(game.players[0]).to.eql(player1._id);
    })



  });

});

//player methods that still have this.game:
// checkMove
// checkEgdeOrPit