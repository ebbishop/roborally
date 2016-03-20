var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var Promise = require('bluebird');

// Require in all models.
require('../../../server/db/models');

var Tile = mongoose.model('Tile');

describe('Tile model', function () {

  beforeEach('Establish DB connection', function (done) {
      if (mongoose.connection.db) return done();
      mongoose.connect(dbURI, done);
  });

  // afterEach('Clear test database', function (done) {
  //     clearDB(done);
  // });

  it('should exist', function () {
      expect(Tile).to.be.a('function');
  });

  describe('Adds tiles', function(){
    var tile1 = {
      edgeN: 'wall0',
      edgeE: null,
      edgeS: null,
      edgeW: 'wall0',
      floor: 'barefloor',
      conveyor: null,
      flag: null
    };
    var tile2 = {
      edgeN: 'wall1',
      edgeE: null,
      edgeS: null,
      edgeW: 'wall0',
      floor: null,
      conveyor: {type: 'straight', magnitude: 2, destination: 'E'},
      flag: null
    };
    var tile2again = {
      edgeN: 'wall1',
      edgeE: null,
      edgeS: null,
      edgeW: 'wall0',
      floor: null,
      conveyor: {type: 'straight', magnitude: 2, destination: 'E'},
      flag: null
    };

    beforeEach('create a tile',function(done){
      Promise.all([Tile.create(tile1), Tile.create(tile2)])
      .then(function(){
        done();
      }, done);
    });

    it('should add tiles to the database', function(done){

      Tile.find()
      .then(function(tiles){
        expect(tiles.length).to.equal(2);
        done();
      }, done);
    });

    describe('should prevent duplicate tiles from being created', function(){
      beforeEach('attempt to add dup tile', function(done){
        Tile.create(tile2again)
        .then(function(tile){
          done();
        },done);
      });
      it('should prevent duplicate tiles from being created', function(done){
        done()
      });

    })

  });

});
