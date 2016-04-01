var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var firebaseHelper = require('../../firebase/firebase');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
require('./board');
require('./player');


var Player = mongoose.model('Player');
var Board = mongoose.model('Board');
                      //x5 hands
var hashOfGames = {}; //[[game.players after card move], [game.players after board move]];

var gameSchema = new mongoose.Schema({
  name: String,
  players: [{type: mongoose.Schema.Types.ObjectId, ref: 'Player'}],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
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
    enum: ['decision', 'run', 'waiting'],
    default: 'waiting'
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
  },
  isWon: {
    type: Boolean,
    default: false
  }
});

gameSchema.plugin(deepPopulate);
gameSchema.set('versionKey',false );



function getRotation (orig, next){
  var dot = -orig[0]*next[1] + orig[1]*next[0];
  var rad = Math.asin(dot);
  var deg = rad * (180/Math.PI);
  return deg;
}

gameSchema.methods.runOneRound = function () {
  this.setNotReady();
  while (this.currentCard < 5){
    this.runOneRegister();
    this.checkEdgeOrPit();
    this.pushGameState();
    this.runBelts(2);
    this.runBelts(1);
    this.runPushers();
    this.runGears();
    this.fireRobotLasers();
    this.fireBoardLasers();
    this.touchRepairs();
    this.touchFlags();
    this.setWinStatus();
    this.pushGameState()

    if(!this.isWon){
      this.currentCard ++;
    }else{
      console.log('game is won');
      break; //game over! is this a good idea?
    }
  }
  console.log('finished running round');
  if(!this.isWon){
    this.currentCard = 0;
    this.emptyRegisters()
    this.dealCards();
    this.initiateDecisionState();
  }
  this.savePlayers();
  this.sendGameStates();
}

gameSchema.methods.setNotReady = function(){
  this.players.forEach(function(p){
    p.ready = false;
  });
  firebaseHelper.getConnection(this._id.toString()).child('game').set(this.toObject());
}

gameSchema.methods.runOneRegister = function () {
  var currentCard = this.currentCard;
  this.players.sort(function(p1, p2){
    if (p1.register[currentCard] > p2.register[currentCard]) return -1;
    return 1;
  })
  this.players.forEach(function(player){
    player.playCard(currentCard)
  })
  console.log('finished running register', this.currentCard);
}

gameSchema.methods.checkEdgeOrPit = function(){
  this.players.forEach(function(p){
    var tile = this.getTileAt(p.position)
    console.log('tile here', p.position, 'is', tile)
    if(!tile || tile.floor === "pit"){
      console.log('abt to lose life from game');
      p.loseLife();
    }
  }, this);
}

gameSchema.methods.runBelts = function(type){
  var game = this;
  var tile;
  console.log('running belt type', type);
  this.players.forEach(function(player){
    console.log('player pos', player.position);
    tile = game.getTileAt(player.position);
    if(tile.conveyor && tile.conveyor[0].magnitude >= type) {
      var c = tile.conveyor[0];
      var nextPosition = [player.position[0] + c.bearing[0], player.position[1] + c.bearing[1]];
      var nextTile = game.getTileAt(nextPosition);
      console.log('player on conveyor', type, 'at', player.position);
      console.log('sending to', nextPosition, 'for tile', nextTile);

      if(nextTile.conveyor) {
        var deg = getRotation(c.bearing, nextTile.conveyor[0].bearing);
        player.rotate(deg);
      }

      player.boardMove(c.bearing);
    }
  });
  this.checkEdgeOrPit();
  console.log('finished running belts', type, 'on card', this.currentCard);
}

gameSchema.methods.getTileAt = function (position) {
  // position is array = [row, col]
  var colStr = 'col' + position[1].toString();
  if(this.board[colStr] && this.board[colStr][position[0]]){
    return this.board[colStr][position[0]];
  }
  return;
}

gameSchema.methods.runGears = function(){
  var game = this;
  this.players.forEach(function(p){
    var tile = game.getTileAt(p.position);
    if (tile.floor === 'gearCW') {
      p.rotate(90);
    } else if (tile.floor === 'gearCCW') {
      p.rotate(-90);
    }
  });
  console.log('finished running gears', this.currentCard);
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
  });
  console.log('ran pushers of type', pushType, 'for card', this.currentCard);
}

gameSchema.methods.getPlayerAt = function(position){
  return this.players.filter(function(p){
    if (p.position[0] === position[0] && p.position[1] === position[1]) return true
    return false;
  })
}

gameSchema.methods.fireRobotLasers = function (){
  var game = this;
  this.players.forEach(function(p){
    game.fireOneLaser({
      start: [p.position[0]+ p.bearing[0], p.position[1]+p.bearing[1]],
      qty: 1,
      bearing: p.bearing,
    })
  });
  console.log('finished firing robot lasers');
};

gameSchema.methods.fireBoardLasers = function (){
  for (var i = 0; i < 12; i ++){
    this.fireLasersInCol(i);
  }
  console.log('finished firing board lasers');
}

gameSchema.methods.fireLasersInCol = function (col) {
  var colStr = 'col' + col.toString();
  var game = this;
  this.board[colStr].forEach(function(tile, i){
    if(tile.edgeN && tile.edgeN.slice(0,4) === 'wall') {
      game.fireOneLaser({start: [i, col], qty:Number(tile.edgeN[4]), bearing: [1, 0, 'S']});
    }
    if(tile.edgeE && tile.edgeE.slice(0,4) === 'wall') {
      game.fireOneLaser({start: [i, col], qty:Number(tile.edgeE[4]), bearing: [0, -1, 'W']});
    }
    if(tile.edgeS && tile.edgeS.slice(0,4) === 'wall') {
      game.fireOneLaser({start: [i, col], qty:Number(tile.edgeS[4]), bearing: [-1, 0, 'N']});
    }
    if(tile.edgeW && tile.edgeW.slice(0,4) === 'wall') {
      game.fireOneLaser({start: [i, col], qty:Number(tile.edgeW[4]), bearing: [0, 1, 'E']});
    }
  });
}


var laserBlockedBy = {
  'N': {exit: 'edgeN', enter: 'edgeS'},
  'S': {exit: 'edgeS', enter: 'edgeN'},
  'E': {exit: 'edgeE', enter: 'edgeW'},
  'W': {exit: 'edgeW', enter: 'edgeE'}
};

gameSchema.methods.fireOneLaser = function(laser){
  var nextLoc = [laser.start[0]+laser.bearing[0], laser.start[1]+laser.bearing[1]];
  var tile, p;
   //find a player at the current location
  p = this.getPlayerAt(laser.start);

  if( p.length > 0 ){
    //if there is a player, apply damage and quit
    p[0].applyDamage(laser.qty);  //evaluate damage
    return;
  }

  //otherwise, get this tile to see if beam can exit
  tile = this.getTileAt(laser.start);
  // if beam cannot exit tile, quit
  if (!tile || tile[laserBlockedBy[laser.bearing[2]]['exit']]){
    return;
  }
  //otherwise, check next tile for entering
  var nextTile = this.getTileAt(nextLoc);

  //if beam cannot enter next tile, quit
  if(!nextTile || nextTile[laserBlockedBy[laser.bearing[2]]['enter']]) {
    return;
  }

  // otherwise, call again with the next tile's location
  // if next loc isn't on board, quit
  laser.start = nextLoc;
  return this.fireOneLaser(laser);
}

gameSchema.methods.touchRepairs = function(){
  var game = this;
  var tile;
  this.players.forEach(function(player){
    tile = game.getTileAt(player.position);
    if (tile.floor === 'wrench1' || tile.floor === 'wrench2') {
      player.applyDamage(-1);
    }
  });
  console.log('touched repairs');
}

gameSchema.methods.touchFlags = function(){
  var game = this;
  var tile;
  this.players.forEach(function(player){
    tile = game.getTileAt(player.position);
    if (tile.flag === player.flagCount + 1) {
      player.touchFlag(tile.flag);
      player.applyDamage(-1);
    }
  });
  console.log('touched flags');
}

gameSchema.methods.dealCards = function() {
  var self = this;

  this.players.forEach(function(player){
    // var playerKey = player._id.toString()
    self.deck = _.shuffle(self.deck)
    var numCardsToDeal = 9-player.damage;

    if(numCardsToDeal > self.deck.length) {
      self.shuffleDeck()
    }

    var cardsToDeal = self.deck.splice(0,numCardsToDeal);
    console.log('cards left in deck', self.deck.length);
    player.hand = cardsToDeal;
  });

  console.log('dealt cards');
  console.log('cards left in deck', self.deck.length);
}

gameSchema.methods.shuffleDeck = function() {
  var cards = this.deck.concat(this.discard);
  this.deck = _.shuffle(cards);
  this.discard = [];
};

gameSchema.methods.areAllPlayersReady = function() {
  var ready = this.players.filter(function(p){
    return p.ready === true;
  })
  return ready.length === this.players.length
}

gameSchema.methods.checkReady = function() {
  if (this.areAllPlayersReady()) {
    this.state = 'run';
    this.runOneRound();
  }
}

gameSchema.methods.setWinStatus = function(){
  var game = this;
  this.players.forEach(function(player){
    if (player.flagCount===game.numFlags) {
      game.isWon = true;
    }
  })
}

gameSchema.methods.initiateDecisionState = function(){
  this.state = 'decision'
}

gameSchema.methods.emptyRegisters = function(){
  var game = this;
  this.players.forEach(function(p){
    var discarded = p.emptyRegister();
    game.discard = game.discard.concat(discarded);
  });
  console.log('emptied registers');
}

gameSchema.methods.assignDocks = function() {
  var game = this;
  var docks = [0,1,2,3,4,5,6,7];
  this.players.forEach(function(player){
    var playerKey = player._id.toString()
    var i = _.sample(docks);
    player.dock = game.board.dockLocations[i];
    player.position = game.board.dockLocations[i];
    docks.splice(docks.indexOf(i),1);
  });
}

//call from route
gameSchema.methods.initializeGame = function (){
  this.assignDocks();
  this.dealCards();
  this.pushGameState();
  this.sendGameStates();
};

gameSchema.methods.pushGameState = function(){
  var publicPlayerArray = this.players.map(function(player){
    var p = {};
    p._id = player._id;
    p.position = player.position;
    p.robot = player.robot;
    p.bearing = player.bearing;
    p.damage = player.damage;
    p.livesRemaining = player.livesRemaining;
    p.register = player.register;
    p.flagCount = player.flagCount;
    p.name = player.name
    return p;
  });
  var state = {players: publicPlayerArray, isWon: this.isWon};
  if(!hashOfGames[this._id]){
    hashOfGames[this._id] = [state]
  }else if(this.currentCard===0 && hashOfGames[this._id].length===10){
    hashOfGames[this._id] = [state];
  }else{
    hashOfGames[this._id].push(state);
  }
  var len = hashOfGames[this._id].length
  console.log('current game state', len-1, hashOfGames[this._id][len-1].players)
}

gameSchema.methods.savePlayers = function(){
  return Promise.map(this.players, function(p){
    return p.save()
  })
}

gameSchema.methods.sendGameStates = function(){
  var gameId = this._id.toString();

  var roundToSend = hashOfGames[this._id];

  firebaseHelper.getConnection(gameId).child('phases').set(JSON.stringify(roundToSend));
  // firebaseHelper.getConnection(gameId).child('phases').set(roundToSend.toObject());

  var privatePlayerArray = this.players.map(function(player){
    var p={};
    p._id = player._id;
    p.hand = player.hand;
    return p;
  });

  privatePlayerArray.forEach(function(player){
    var playerId = player._id.toString();
    firebaseHelper.getConnection(gameId).child(playerId).set(player.hand.toObject());
  });

}


mongoose.model('Game', gameSchema);















