var mongoose = require('mongoose');
var Promise = require('bluebird');
var firebaseHelper = require('../../firebase/firebase');
require('./board');
require('./player');

var Player = mongoose.model('Player');
var Board = mongoose.model('Board');

// could a game have flag locations, instead of having to put these on the tile of the board?
// could we handle the dock locations the same way?
// or maybe even the entire little add-on boards?

// could boards be static things and games have courses?
// and courses have boards?


var gameSchema = new mongoose.Schema({
  name: String,
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
    enum: ['decision', 'boardmove', 'programmedmove'],
  },
  currentCard: {
    type: Number,
    default: 0
  },
  deck: { type: [Number],
    default: [10,20,30,40,50,60,70,90,110,130,150,170,190,210,230,250,270,290,310,330,350,370,390,410,80,100,120,140,160,180,200,220,240,260,280,300,320,340,360,380,400,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730,740,750,760,770,780,790,800,810,820,830,840]},
  discard: [Number],
});

gameSchema.set('versionKey',false );

var laserBlockedBy = {
  'N': {exit: 'edgeN', enter: 'edgeS'},
  'S': {exit: 'edgeS', enter: 'edgeN'},
  'E': {exit: 'edgeE', enter: 'edgeW'},
  'W': {exit: 'edgeW', enter: 'edgeE'}
};

gameSchema.methods.runOneRegister = function () {
  var currentCard = this.currentCard;
  return this.getPlayers()
  .then(function(players){
    return players.sort(function(p1, p2){
      if (p1.card[currentCard] > p2.card[currentCard]) return -1;
      return 1;
    });
  })
  .then(function(players){
    players.forEach(function(player){
      player.playCard(currentCard);
    });
  })
  .then(function(){
    this.currentCard ++;
  })
};

gameSchema.methods.getPlayers = function (){
  return Player.find({game: this._id});
}

gameSchema.methods.getPlayerTiles = function () {
  return this.getPlayers()
  .then(function(players){
    return Promise.map(players, function(p){
      return p.attachMyTile()
    })
  })
}

gameSchema.methods.getBoardWithTiles = function () {
  return Board.findById(this.board)
  .populate('col0')
  .populate('col1')
  .populate('col2')
  .populate('col3')
  .populate('col4')
  .populate('col5')
  .populate('col6')
  .populate('col7')
  .populate('col8')
  .populate('col9')
  .populate('col10')
  .populate('col11')
  .exec();
};

gameSchema.methods.runGears = function (){
  return this.getPlayerTiles().bind(this)
  .then(function(playersWithTile){
    return Promise.map(playersWithTile, function(p){
      if (p.tile.floor === 'gearCW') return p.rotate(90);
      else if(p.tile.floor ===  'gearCCW') return p.rotate(-90);
    });
  });
};
// stopping here for tonight
gameSchema.methods.runPushers = function (){
  return this.getPlayerTiles().bind(this)
  .then(function(playersWithTile){
    return Promise.map(playersWithTile, function(p){
      if (p.tiles.edgeN === 'push1') return
    });
  })
}

gameSchema.methods.runBelts = function(type) { //type is 1 or 2. 1 = all
  return this.getPlayerTiles().bind(this)
  .then(function(playersWithTile){
    return Promise.map(playersWithTile, function(p){
      if (p.tile.conveyor && p.tile.conveyor.magnitude >=type){
        return p.boardMove(p.tile.conveyor.bearing);
      }
    });
  })
  .then(function(players){
    return this.checkPostBeltLocs(type);
  });
};


gameSchema.methods.checkPostBeltLocs = function (type, prevloc){
  return this.getPlayerTiles()
  .then(function(playersWithTile){
    return Promise.map(playersWithTile, function(p){
      if (p.tile.conveyor && p.tile.conveyor.magnitude >=type){
        if (p.tile.conveyor.type === 'clockwise') return p.rotate(90)
        else if(p.tile.conveyor.type === 'counterclock') return p.rotate(-90)
        // 'merge1CCW', 'merge1CW', 'merge2'
        // else if(p.tile.conveyor.type === ''){} DON'T KNOW WHAT TO DO WITH THIS
      }
      else if (p.tile.floor === 'pit' || !p.tile){
        return p.loseLife();
      }
    })
  })
}

gameSchema.methods.fireRobotLasers = function (){
  return this.getPlayers().bind(this)
  .then(function(players){
    players.forEach(function(p){
      gameSchema.methods.fireOneLaser({
        start: p.position,
        qty: 1,
        bearing: p.bearing,
        direction: p.compassDirection
      });
    });
  });
};

gameSchema.methods.fireBoardLasers = function (){
  for (var i = 0; i < 12; i ++){
    this.fireLasersInCol(i);
  }
}

gameSchema.methods.fireLasersInCol = function (col) {
  var start, bearing, qty, direction;
  var colStr = 'col' + col.toString();
  return Board.findById(this.board)
  .then(function(b){
    b.colStr.forEach(function(tile, i){
      if(tile.edgeN.slice(0,4) === 'wall') {
        gameSchema.methods.fireOneLaser({start: [i, col], qty:Number(tile.edgeN[4]), bearing: [1, 0], direction: 'S'});
      }
      if(tile.edgeE.slice(0,4) === 'wall') {
        gameSchema.methods.fireOneLaser({start: [i, col], qty:Number(tile.edgeE[4]), bearing: [0, -1], direction: 'W'});
      }
      if(tile.edgeS.slice(0,4) === 'wall') {
        gameSchema.methods.fireOneLaser({start: [i, col], qty:Number(tile.edgeS[4]), bearing: [-1, 0], direction: 'N'});
      }
      if(tile.edgeW.slice(0,4) === 'wall') {
        gameSchema.methods.fireOneLaser({start: [i, col], qty:Number(tile.edgeW[4]), bearing: [0, 1], direction: 'E'});
      }
    });
  })
}

gameSchema.methods.fireOneLaser = function(laser){
  // laser has qty, bearing, direction (string), start properties
  var currLoc = laser.start;
  var nextLoc = laser.start;
    // check current location for obstacles to exiting
  return this.getPlayerAt(currLoc).bind(this)
  .then(function(p){
    if (p){
      p.applyDamage(laser.qty);
      return;
    }else{
      return this.getTileAt(currLoc)
      .then(function(t){
        if(t[laserBlockedBy[laser.direction].exit]) return;
        return t;
      })
    }
  })
  .then(function(t){
    if(t) { //check ability to enter next tile
      nextLoc[0] += laser.bearing[0];
      nextLoc[1] += laser.bearing[1];
      return this.getTileAt(nextLoc)
      .then(function(t){
        if(t && t[laserBlockedBy[laser.direction].enter]) return;
        return t;
      })
    }
    return;
  })
  .then(function(t){
    if(t){
      laser.start[0] += laser.bearing[0];
      laser.start[1] += laser.bearing[1];
      gameSchema.methods.fireOneLaser(laser);
    }
  })

};

gameSchema.methods.getPlayerAt = function(position){
  return this.getPlayers()
  .then(function(players){
    return players.filter(function(p){
      if (p.position === position) return true
      return false;
    })
  })
}

gameSchema.methods.getTileAt = function (position) {
  // position is array = [row, col]
  var colStr = 'col' + col.toString();
  return Board.findById(this.board)
  .then(function(b){
    return b[colStr][row];
  })
  .then(function(tId){
    return Tile.findById(tId);
  });
}

gameSchema.methods.initializeGame = function(){

};

mongoose.model('Game', gameSchema);








// // does not take into account interactions between players on one turn
// gameSchema.methods.runOneCard = function (){
//   //this is the current register we are interested in
//   var currentCard = this.currentCard;

//   //get all players for this game
//   return this.getPlayers()
//   .then(function(players){
//     // sort players by card number
//     return players.sort(function(p1, p2){
//       if(p1.register[currentCard] < p2.register[currentCard]) return -1;
//       return 1;
//     });
//     return players;
//   })
//   .then(function(players){
//     return Promise.map(players, function(player){

//     })
//   })
// };



// gameSchema.methods.shuffleCards = function (){

// }

// gameSchema.methods.sendPlayers = function (){
//   this.getPlayers()
//   .then(function(players){
//     // send to firebase
//   })
// }





















// gameSchema.methods.toggleState = function(argument) {
//   // body...
// };

// gameSchema.methods.dealCards = function(){
//     // splice cards from this.deck
//     // send to players where {game: this._id}

// };

// //incomplete
// gameSchema.methods.getPlayerCardCt = function(){
//   return mongoose.model('Player').find({game: this._id})
//   .then(function(players){
//     return Promise.map(players, function(player){
//       return 9 - player.damage;
//     });
//   });
// };

// // returns promise for true/false
// gameSchema.methods.checkReady = function(){
//   return this.getPlayers()
//   .then(function(players){
//     var ready = players.map(function(player){
//       return player.ready;
//     });
//     if (ready.indexOf(false)>-1) return false
//     return true;
//   });
// };

// var cardNums = [10,20,30,40,50,60,70,90,110,130,150,170,190,210,230,250,270,290,310,330,350,370,390,410,80,100,120,140,160,180,200,220,240,260,280,300,320,340,360,380,400,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730,740,750,760,770,780,790,800,810,820,830,840];
// gameSchema.methods.initializeGame = function(){
//   // may make more sense to make this in a separate module
//   return this.update({deck: newDeck}).save()
// };

// mongoose.model('Game', gameSchema);
