var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var Promise = require('bluebird');

// Require in all models.
require('../../../server/db/models');

var Player = mongoose.model('Player');
var Game = mongoose.model('Game');

describe ('game logic', function(){

  beforeEach('Establish DB connection', function (done) {
    console.log('db:', mongoose.connection.db);
    if (mongoose.connection.db) {
      console.log('connected:', mongoose.connected.db);
      return done();
    }
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
    clearDB(done);
  });

  describe('player model', function(){
    var player1 = new Player({
        position: [2,5],
        bearing: [1,0]
      });

    it('should have location', function(){
      expect(player1.position.toObject()).to.eql([2,5]);
    });

    describe('move function', function(){
      var player1 = new Player({
        position: [2,5],
        bearing: [1,0]
      });
      it('should move player according to bearing and magnitude', function(){
        player1.move(1);
        expect(player1.position.toObject()).to.eql([3,5]);
      });
      it('should move player more than 1 square', function(){
        player1.move(3);
        expect(player1.position.toObject()).to.eql([6,5])
      });
      it('move of 0 should not move player', function(){
        player1.move(0);
        expect(player1.position.toObject()).to.eql([6,5]);
      })
    });

    describe('rotate function', function(){
      beforeEach('create 1 player', function(){
        var player1 = new Player({
          position: [2,5],
          bearing: [1,0]
        });
      });
      it('should turn the player to the right 90 deg', function(){
        player1.rotate(90);
        expect(player1.bearing.toObject()).to.eql([0,-1]);
      });

      it('should turn the player to the left 90 deg', function(){
        player1.rotate(-90);
        player1.rotate(-90);
        expect(player1.bearing.toObject()).to.eql([0,1]);
      });
      it('should turn the player 180 deg', function(){
        player1.rotate(180);
        expect(player1.bearing.toObject()).to.eql([0,-1]);
      });
      it('rotation of 0 should not turn the player', function(){
        player1.rotate(0);
        expect(player1.bearing.toObject()).to.eql([0,-1]);
      })

    });

    describe('playCard function', function(){
      var player2 = new Player({
        position: [2,5],
        bearing: [1,0],
        register: [370, 600, 590, 10, 220]
      });
      // RL, move1, move1, Uturn, RR
      it('should have cards', function(){
        expect(player2.register.toObject()).to.eql([370, 600, 590, 10, 220]);
      });
      it('should play the first card', function(){
        player2.playCard(0);
        expect(player2.position.toObject()).to.eql([2,5]);
        expect(player2.bearing.toObject()).to.eql([0,1]);
      })
      it('should play any card', function(){
        player2.playCard(1);
        expect(player2.position.toObject()).to.eql([2,6]);
        expect(player2.bearing.toObject()).to.eql([0,1]);
      })

    });
  });

  describe('game model', function(){
    var game1;
    beforeEach(function(done){
      game1 = new Game({});
      console.log(game1);
      return Promise.all([
          Game.create(game1)/*,
          Player.create({
            game: game1._id,
            position: [2,5],
            bearing: [1,0],
            register: [370, 600, 590, 10, 220]
            // RL, move1, move1, Uturn, RR
          }),
          Player.create({
            game: game1._id,
            position: [7,7],
            bearing: [-1,0],
            register: [40, 490, 380, 430, 710]
            // Uturn, move1, RR, back up, move2
          })*/
        ])
      .then(function(g){
        done();
      })
      })

      it('should create a game', function(done){
        console.log('finding a game')
        Game.find()
        .then(function(g){
          console.log("in game find success");
          expect(g.length).to.equal(1);
          done()
        })
        .then(null, done)
      });

    });


});
