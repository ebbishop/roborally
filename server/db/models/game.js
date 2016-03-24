var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var firebaseHelper = require('../../firebase/firebase');
require('./board');
require('./player');


var Player = mongoose.model('Player');
var Board = mongoose.model('Board');
                      //x5 hands
var gameFB = []; //[[game.players after card move], [game.players after board move]];

// could a game have flag locations, instead of having to put these on the tile of the board?
// could we handle the dock locations the same way?
// or maybe even the entire little add-on boards?

// could boards be static things and games have courses?
// and courses have boards?


var gameSchema = new mongoose.Schema({
  name: String,
  players: [{type: mongoose.Schema.Types.ObjectId, ref: 'Player'}],
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  },
  active: {
    type: Boolean,
    default: true
  },
  state: {
    type: String,
    enum: ['decision', 'boardmove', 'programmedmove', 'gameover'],
  },
  currentCard: {
    type: Number,
    default: 0
  },
  deck: { 
    type: [Number],
    default: [10,20,30,40,50,60,70,90,110,130,150,170,190,210,230,250,270,290,310,330,350,370,390,410,80,100,120,140,160,180,200,220,240,260,280,300,320,340,360,380,400,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730,740,750,760,770,780,790,800,810,820,830,840]
  },
  discard: [Number],
  numFlags: {
    type: Number,
    enum: [1,2,3,4]
  }
});

gameSchema.set('versionKey',false );


var laserBlockedBy = {
  'N': {exit: 'edgeN', enter: 'edgeS'},
  'S': {exit: 'edgeS', enter: 'edgeN'},
  'E': {exit: 'edgeE', enter: 'edgeW'},
  'W': {exit: 'edgeW', enter: 'edgeE'}
};

function getRotation (orig, next){
  var dot = -orig[0]*next[1] + orig[1]*next[0];
  var rad = Math.asin(dot);
  var deg = rad * (180/Math.PI);
  return deg;
}

gameSchema.methods.runOnePhase = function () {
  while (this.currentCard < 5){
    this.runOneRegister();
    this.runBelts(2);
    this.runBelts(1);
    this.runPushers();
    this.runGears();
    this.fireRobotLasers();
    this.fireBoardLasers();
    this.currentCard ++;
  }
  this.dealCards();
  this.initiatePhase();
}

gameSchema.methods.runOneRegister = function () {
  var currentCard = this.currentCard;
  
  this.players.sort(function(p1, p2){
    if (p1.card[currentCard] > p2.card[currentCard]) return -1;
    return 1;
  })

  players.forEach(function(player){
    player.playCard(currentCard)
  })
}

gameSchema.methods.runBelts = function(type){
  var game = this;
  var tile;
  this.players.forEach(function(player){
    tile = game.getTileAt(player.position);
    if(tile.conveyor && tile.conveyor.magnitude >= type) {
      var c = tile.conveyor;
      var nextPosition = [player.position[0] + c.bearing[0], player.position[1] + c.bearing[1]];
      var nextTile = game.getTileAt(nextPosition);

      if(nextTile.conveyor) {
        var deg = getRotation(orig, next);
        player.rotate(deg);
      } 

      player.boardMove(c.bearing);
    }
  })
}

gameSchema.methods.getTileAt = function (position) {
  // position is array = [row, col]
  var colStr = 'col' + position[1].toString();
  return this.board[colStr][position[0]];
}

gameSchema.methods.runGears = function(type){
  var game = this;
  this.players.forEach(function(p){
    var tile = game.getTileAt(p.position);
    if (tile.floor === 'gearCW') {
      p.rotate(90);
    } else if (tile.floor === 'gearCCW') {
      p.rotate(-90);
    }
  })
}

gameSchema.methods.runPushers = function(){
  var game = this;
  var pushType = (this.currentCard % 2) + 1;
  this.players.forEach(function(p){
    var tile = game.getTileAt(p.position);
    if(tile.edgeN === 'push' + pushType.toString()) {
      p.boardMove([1, 0]);
    }
    if(tile.edgeE === 'push' + pushType.toString()) {
      p.boardMove([0, -1]);
    }
    if(tile.edgeS === 'push' + pushType.toString()) {
      p.boardMove([-1, 0]);
    }
    if(tile.edgeW === 'push' + pushType.toString()) {
      p.boardMove([0, 1]);
    }
  })
}

gameSchema.methods.getPlayerAt = function(position){
  return this.players.filter(function(p){
    if (p.position[0] === position[0] && p.position[1] === position[1]) return true
    return false;
  })
}

gameSchema.methods.fireRobotLasers = function (){
  var game = this;
  players.forEach(function(p){
    fireOneLaser({
      start: [p.position[0]+ p.bearing[0], p.position[1]+p.bearing[1]],
      qty: 1,
      bearing: p.bearing,
    })
  });
};

gameSchema.methods.fireBoardLasers = function (){
  for (var i = 0; i < 12; i ++){
    this.fireLasersInCol(i);
  }
}

gameSchema.methods.fireLasersInCol = function (col) {
  var colStr = 'col' + col.toString();
  this.board[colStr].forEach(function(tile){
    if(tile.edgeN.slice(0,4) === 'wall') {
      this.fireOneLaser({start: [i, col], qty:Number(tile.edgeN[4]), bearing: [1, 0, 'S']});
    }
    if(tile.edgeE.slice(0,4) === 'wall') {
      this.fireOneLaser({start: [i, col], qty:Number(tile.edgeE[4]), bearing: [0, -1, 'W']});
    }
    if(tile.edgeS.slice(0,4) === 'wall') {
      this.fireOneLaser({start: [i, col], qty:Number(tile.edgeS[4]), bearing: [-1, 0, 'N']});
    }
    if(tile.edgeW.slice(0,4) === 'wall') {
      this.fireOneLaser({start: [i, col], qty:Number(tile.edgeW[4]), bearing: [0, 1, 'E']});
    }
  })
}

gameSchema.methods.fireOneLaser = function(laser){
  var nextLoc = laser.start;
  var tile, p;

   //find a player at the current location
  p = this.getPlayerAt(currLoc);

  if( p.length > 0 ){
    //if there is a player, apply damage and quit
    p.applyDamage(laser.qty); 
    return;
  }
  
  //otherwise, get this tile to see if beam can exit
  tile = this.getTileAt(currLoc); 

  // if beam cannot exit tile, quit
  if (tile[laserBlockedBy[laser.direction]['exit']]) return;

  //otherwise, check next tile for entering
  nextLoc[0]+=laser.bearing[0];
  nextLoc[1]+=laser.bearing[1];
  nextTile = getTileAt(nextLoc);

  //if beam cannot enter next tile, quit
  if(nextTile[laserBlockedBy[laser.bearing[2]]['enter']]) return;

  // otherwise, call again with the next tile's location  
  laser.start = nextLoc;
  return this.fireOneLaser(laser);
}


// one phase = one register (one card) + one complete board move
// there are five phases per round
gameSchema.methods.dealCards = function() {
  var numCardsToDeal,cardsToDeal;
  var self = this;
  this.players.forEach(function(player){
    numCardsToDeal = 9-player.damage;

    if(numCardsToDeal > self.deck.length) {
      self.shuffleDeck()
    }
    cardsToDeal = self.deck.splice(0,numCardsToDeal);
    player.hand = cardsToDeal;
  });
}

gameSchema.methods.shuffleDeck = function() {
  var cards = this.deck.concat(this.discardDeck);
  this.deck = _.shuffle(cards);
  this.discardDeck = [];
};

gameSchema.methods.allPlayersReady = function() {
  var ready = this.players.filter(function(p){
    if(p.ready) return true;
    return false;
  })

  if (ready.length === this.players.length) return true;
  return false;
}

gameSchema.methods.initiatePhase = function() {
  if (this.allPlayersReady()) this.runOnePhase()
}

// not sure what to do with these
gameSchema.methods.assignDocks = function() {
  return this.getPlayers()
  .then(function(players){
    var numPlayers = players.length;
    var docks = [1,2,3,4,5,6,7,8];

    return players.reduce(function(acc, player){
      return acc.then(function() {
        var dockNum = _.sample(docks)
        player.dock = dockNum;
        var idx = docks.indexOf(dockNum)
        docks.splice(idx, 1);
        return player.save()    
      })
    }, Promise.resolve())
  })
}

gameSchema.methods.initializeGame = function (){
  this.dealCards();
};



mongoose.model('Game', gameSchema);















