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
      Board.findOne({name: 'Risky Exchange'})
      .then(function(b){
        board = b;
        done()
      })
      .then(null, done)
    });
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
      game.players.push(player1, player2, player3);
    beforeEach('set things on board', function(done){
      game.set('board', board);
      return Promise.all([game.save(), player1.save(), player2.save(), player3.save()])
      .then(function(){
        return Game.findById(game._id)
      })
      .then(function(g){
        return g.deepPopulate(['board.col0', 'board.col1', 'board.col2', 'board.col3', 'board.col4',
          'board.col5', 'board.col6', 'board.col7', 'board.col8', 'board.col9', 'board.col10',
          'board.col11', 'players.player'])
      })
      .then(function(g){
        game = g;
        done()
      })
      .then(null, done)
    })

    after(function(done){
      Promise.all([
        Game.remove({}),
        Player.remove({})
      ])
      .then(function(){
        done();
      })
      .then(null, done)
    })

    it('should have players', function(){
      expect(game.players.length).to.equal(3);
    });
    it('should have appropriate players', function(){
      expect(game.players[1].name).to.equal('jisoo');
    });
    it('player should have correct locations', function(){
      expect(game.players[2].position.toObject()).to.eql([14,3]);
    });


    xdescribe('Player functionality', function(){

      describe('lose life', function(){
        beforeEach(function(){
          game.players[0].loseLife();
        })
        it('lose life should decrease player lives', function(){
          expect(game.players[0].livesRemaining).to.equal(2);
        })
        it('lose life should not affect other players', function(){
          expect(game.players[0].livesRemaining).to.equal(2);
          expect(game.players[1].livesRemaining).to.equal(3);
        })
        it('should kill player when no lives are left', function(){
          game.players[0].loseLife();
          game.players[0].loseLife();
          expect(game.players[0].livesRemaining).to.equal(0);
          expect(game.players[0].position).to.equal(null);
        })
      });

      describe('apply damage', function(){
        beforeEach(function(){
          game.players[0].applyDamage(2);
        })
        it('should increment damage on one player', function(){
          expect(game.players[0].damage).to.equal(2);
        });
        it('should not increment damage on other players', function(){
          expect(game.players[2].damage).to.equal(0);
        })
        it('should accept negative values', function(){
          game.players[0].applyDamage(-1);
          expect(game.players[0].damage).to.equal(1);
        })
        it('should cause player to loose life after 9 damage', function(){
          game.players[1].applyDamage(10);
          expect(game.players[1].damage).to.equal(0);
          expect(game.players[1].livesRemaining).to.equal(2);
        })
      })

      describe('set register', function(){
        beforeEach(function(){
          game.players[0].setRegister([800,570,380,60,450]);
          game.players[1].setRegister([740, 180, 700, 390, 530]);
        })

        it('setRegister should add cards to players register', function(){
          expect(game.players[0].register.toObject()).to.eql([800,570,380,60,450])
        });

      });
      describe('emptyRegister', function(){
        var reg1, reg2;
        beforeEach(function(){
          game.players[0].setRegister([800,570,380,60,450]);
          game.players[1].setRegister([740, 180, 700, 390, 530]);
          game.players[1].applyDamage(6);
          reg1 = game.players[0].emptyRegister();
          reg2 = game.players[1].emptyRegister();
        });
        it('should empty register of players with no damage', function(){
          expect(game.players[0].register.toObject()).to.eql([0,0,0,0,0])
        });
        it('should take damage into account', function(){
          expect(game.players[1].register.toObject()).to.eql([0,0,0,390,530]);
        });
        it('should return the cards removed from the register', function(){
          expect(reg1).to.eql([800,570,380,60,450]);
        });
        it('should return only the cards removed from the register', function(){
          expect(reg2).to.eql([740, 180, 700]);
        })
      })


      describe('play card', function(){
        beforeEach(function(){
          // set registers
          game.players[0].setRegister([800,570,380,60,450]);
          game.players[1].setRegister([740, 180, 700, 390, 530]);
          game.players[2].setRegister([270, 200, 640, 750, 510]);
          // play cards
          game.players[0].playCard(0);
          game.players[2].playCard(0);
        })
        it('should move one player according to card', function(){
          expect(game.players[0].position.toObject()).to.eql([12,5]);
          expect(game.players[0].bearing.toObject()).to.eql([-1,0,'N']);
        });
        it('should rotate player according to card', function(){
          expect(game.players[2].position.toObject()).to.eql([14,3]);
          expect(game.players[2].bearing.toObject()).to.eql([0,-1,'W']);
        });
      });

      describe('touch flag', function(){
        beforeEach(function(){
          game.players[1].touchFlag();
        });
        it('should increment players flag count', function(){
          expect(game.players[1].flagCount).to.equal(1);
        });
        it('should not increment other players flag counts', function(){
          expect(game.players[2].flagCount).to.equal(0);
        })
      });
// not yet tested:
// iAmReady
// boardMove

    })

    describe('Game model', function(){
      describe('run one register', function(){
        beforeEach(function(){
          game.players[0].setRegister([800,570,380,60,450]);
          // [15,5], 3, 1, R, U, -1
          game.players[1].setRegister([740, 180, 700, 390, 530]);
          // [15,6] 2, R, 2, L, 1
          game.players[2].setRegister([270, 200, 640, 750, 510]);
          // [14,3] L, R, 1, 2, 1
          game.runOneRegister();
        });
        it('should have 3 players', function(){
          expect(game.players.length).to.equal(3);
        })
        it('game should have players with registers', function(){
          expect(game.players[0].register).to.have.length(5);
        });
        it('should play first card of one player', function(){
          expect(game.players[0].position.toObject()).to.eql([12,5]);
        });
        it('should play first card of all players', function(){
          expect(game.players[1].bearing.toObject()).to.eql([-1,0,'N'])
          expect(game.players[1].position.toObject()).to.eql([13,6]);
          expect(game.players[2].bearing.toObject()).to.eql([0,-1,'W']);
        });
      });
      describe('get tile at', function(){
        it('should return the tile object of a location', function(){
          var tile = game.getTileAt([9,5]);
          expect(tile).to.exist;
        })

      });
      describe('run belts', function(){
        beforeEach(function(){
          game.players[0].set('position', [9,5]); //mag 2, bearing s
          game.players[1].set('position',[1,11]); //magnitude 1, bearing w
          game.players[2].set('position', [7,7]);
        })
        describe('run express belts', function(){
          beforeEach(function(){
            game.runBelts(2);
          })
          it('should move players on express belts',function(){
            expect(game.players[0].position.toObject()).to.eql([10,5]);
          });
          it('should not move players on regular belts', function(){
            expect(game.players[1].position.toObject()).to.eql([1,11]);
          })
          it('should not move players not on belts', function(){
            expect(game.players[2].position.toObject()).to.eql([7,7]);
          })
        });
        describe('run all belts', function(){
          beforeEach(function(){
            game.runBelts(1);
          })
          it('should move players on express belts',function(){
            expect(game.players[0].position.toObject()).to.eql([10,5]);
          });
          it('should ALSO move players on regular belts', function(){
            expect(game.players[1].position.toObject()).to.eql([1,10]);
          })
          it('should not move players not on belts', function(){
            expect(game.players[2].position.toObject()).to.eql([7,7]);
          })
        });
      });


    })
  });

});

//player methods that still have this.game:
// checkMove
// checkEgdeOrPit