var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var Promise = require('bluebird');

// Require in all models.
require('../../../server/db/models');

var Player = mongoose.model('Player');

describe ('Player model', function(){
  var player1 = new Player({
      position: [2,5],
      bearing: [1,0]
    });

  it('should have location', function(){
    expect(player1.position).to.eql([2,5]);
  });

  describe('move function', function(){
    var player1 = new Player({
      position: [2,5],
      bearing: [1,0]
    });
    it('should move player according to bearing and magnitude', function(){
      player1.move(1);
      expect(player1.position).to.eql([3,5]);
    });
    it('should move player more than 1 square', function(){
      player1.move(3);
      expect(player1.position).to.eql([6,5])
    });
    it('move of 0 should not move player', function(){
      player1.move(0);
      expect(player1.position).to.eql([6,5]);
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
      expect(player1.bearing).to.eql([0,1]);
    });

    it('should turn the player to the left 90 deg', function(){
      player1.rotate(-90);
      player1.rotate(-90);
      expect(player1.bearing).to.eql([0,-1]);
    });
    it('should turn the player 180 deg', function(){
      player1.rotate(180);
      expect(player1.bearing).to.eql([0,1]);
    });
    it('rotation of 0 should not turn the player', function(){
      player1.rotate(0);
      expect(player1.bearing).to.eql([0,1]);
    })
    // it('should not turn')
      // player1.rotate(0);
      // expect(player1.bearing).to.eql([0,-1]);
  });

});
