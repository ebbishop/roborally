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

gameSchema.methods.getPlayers = function (){
  return this.players;
};

gameSchema.methods.initiatePhase = function() {
  //runOneRegister(),
  //runBelts(2),
  //runBelts(1),

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
  this.players.forEach(function(player){
    var tile = game.getTileAt(player.position);
    if(tile.conveyor && tile.conveyor.magnitude >= type) {
      var c = tile.conveyor;
      var nextPosition = [player.position[0] + c.bearing[0], [player.position[1] + c.bearing[1]] ];
      
      var nextTile = game.getTileAt(nextPosition);
      if(nextTile.conveyor) {
        var deg = getRotation(orig, next);
        player.rotate(deg);
        player.boardMove(c.bearing);
        
      } else {
        player.boardMove(c.bearing);
      }
    }
  })
}


gameSchema.methods.getTileAt = function (position) {
  // position is array = [row, col]
  var colStr = 'col' + position[1].toString();

  return this.board[colStr][position[0]];
}

gameSchema.methods.runPushers = function (){
  for (var i = 0; i < 12; i++){
    this.runPushersInCol(i);
  }
}

gameSchema.methods.runPushersInCol = function (col){
  var colStr = 'col' + col.toString();
  var pushType = (this.currentCard % 2) + 1;

  this.board[colStr].forEach(function(tile, i){
    if(tile.edgeN === 'push' + pushType.toString()) {
        return this.pushOnePusher({bearing: [1, 0], start: [i, col]});
    }
    if(tile.edgeE === 'push' + pushType.toString()) {
      return this.pushOnePusher({bearing: [0, -1], start: [i, col]});
    }
    if(tile.edgeS === 'push' + pushType.toString()) {
      return this.pushOnePusher({bearing: [-1, 0], start: [i, col]});
    }
    if(tile.edgeW === 'push' + pushType.toString()) {
      return this.pushOnePusher({bearing: [0, 1], start: [i, col]});
    }
  }) 
}

gameSchema.methods.pushOnePusher = function (pusher){
  // pusher has bearing & position
  this.getPlayerAt(pusher.start)
  .then(function(p){
    if(p) return p.boardMove(pusher.bearing);
    return;
  });
};

gameSchema.methods.getPlayerAt = function(position){
  this.players.filter(function(p){
    if (p.position[0] === position[0] && p.position[1] === position[1]) return true
    return false;
  })
}















gameSchema.methods.initializeGame = function (){
  var game = this;
  game.assignDocks()
  .then(function(){
    game.dealCards()
  })
};

gameSchema.methods.initiatePhase = function() {
  var game = this
  var allPlayers;
  return this.getPlayers()
  .then(function(players) {
    allPlayers = players.length
    return players.filter(function(player) {
      return player.ready == true
    })
  })
  .then(function(readyPlayers) {
    if (readyPlayers.length == allPlayers) game.runOnePhase()
  })
}

// one phase = one register (one card) + one complete board move
// there are five phases per round
gameSchema.methods.runOnePhase = function () {
  var game = this;
  while (this.currentCard < 5){
    return this.runOneRegister().bind(this)
    .then(function(){
      return this.runBelts(2)
    })
    .then(function(){
      return this.runBelts(1)
    })
    .then(function(){
      return this.runPushers();
    })
    .then(function(){
      return this.runGears();
    })
    .then(function(){
      return this.fireRobotLasers();
    })
    .then(function(){
      return this.fireBoardLasers();
    })
    .then(function(){
      return this.update({$inc: {currentCard: 1}})
    })
  }
  game.shuffleCards()
  .then(function() {
    return game.dealCards()
  })
  .then(function() {
    return game.initiatePhase()
  })
}




gameSchema.methods.getPlayerTiles = function () {
  return this.getPlayers()
  .then(function(players){
    return Promise.map(players, function(p){
      return p.attachMyTile()
    });
  });
};

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









gameSchema.methods.fireRobotLasers = function (){
  var fired = [];
  return this.getPlayers().bind(this)
  .then(function(players){
    players.forEach(function(p){
      fired.push(this.fireOneLaser({
        start: p.position,
        qty: 1,
        bearing: p.bearing,
        direction: p.compassDirection
      }))
    });
    return Promise.all(fired);
  });
};

gameSchema.methods.fireBoardLasers = function (){
  var fired = [];
  for (var i = 0; i < 12; i ++){
    fired.push(this.fireLasersInCol(i));
  }
  return Promise.all(fired)
}

gameSchema.methods.fireLasersInCol = function (col) {
  var colStr = 'col' + col.toString();
  return Board.findById(this.board).bind(this)
  .then(function(b){
    b.colStr.forEach(function(tile, i){
      if(tile.edgeN.slice(0,4) === 'wall') {
        return this.fireOneLaser({start: [i, col], qty:Number(tile.edgeN[4]), bearing: [1, 0], direction: 'S'});
      }
      if(tile.edgeE.slice(0,4) === 'wall') {
        return this.fireOneLaser({start: [i, col], qty:Number(tile.edgeE[4]), bearing: [0, -1], direction: 'W'});
      }
      if(tile.edgeS.slice(0,4) === 'wall') {
        return this.fireOneLaser({start: [i, col], qty:Number(tile.edgeS[4]), bearing: [-1, 0], direction: 'N'});
      }
      if(tile.edgeW.slice(0,4) === 'wall') {
        return this.fireOneLaser({start: [i, col], qty:Number(tile.edgeW[4]), bearing: [0, 1], direction: 'E'});
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
      return p.applyDamage(laser.qty);
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
      return this.fireOneLaser(laser);
    }
  })

};



//call this method before every deal
gameSchema.methods.shuffleCards = function () {
    var self = this;
    return self.getPlayers()
    .then(function(players){
        var numPlayers = players.length;
        //calculate the minimum number of cards needed to complete one full deal assuming that all players are being dealt 9 cards
        var minNumCards = numPlayers * 9

        //if there are not enough cards for one deal, then add the discard pile to the deck before shuffling
        if(self.deck.length < minNumCards) {
            var newDeck = self.set('deck', self.deck.concat(self.discard));
            var saveNewDeck = newDeck.save()

            var newDiscardPile = self.set('discard', []);
            var saveNewDiscardPile = newDiscardPile.save()

            return Promise.all([saveNewDeck, saveNewDiscardPile])
            .spread(function(savedNewDeck, savedNewDiscardPile) {
                var shuffledDeck = _.shuffle(savedNewDeck);
                self.deck = shuffledDeck;
                return self.save();
            })
        }
        else {
            var shuffledDeck = _.shuffle(self.deck);
            self.deck = shuffledDeck;
            return self.save();
        }
    })
}

//helper function for dealCards method
gameSchema.methods.numberOfCardsToDeal = function() {
    var self = this;
    var numCards = 0;
    return self.getPlayers()
    .then(function(players){
        players.forEach(function(player){
            numCards += 9 - player.damage;
        })
        return numCards;
    })
}

//this method is called after all the players have cleared their hands
//playerSchema.methods.clearHand() <== this is where we discard cards as well
gameSchema.methods.dealCards = function() {
    var self = this;
    var deck = self.deck
    var numCardsToDeal,cardsToDeal;

    return self.numberOfCardsToDeal()
    .then(function(numCards){
        numCardsToDeal = numCards;
        cardsToDeal = deck.slice(0, numCardsToDeal)
        self.deck = deck.slice(numCardsToDeal);
        return self.save();
    })
    .then(function(game) {
      game.getPlayers()
    })
    .then(function(players){
      return players.reduce(function(accumulator, player){
        return accumulator.then(function(){
            var newHand = cardsToDeal.slice(0, 9-player.damage)
            cardsToDeal.splice(0, 9-player.damage)
            player.hand = newHand;
            return player.save();
        });
      }, Promise.resolve())
    })
}

gameSchema.methods.areAllPlayersReady = function() {
    return this.getPlayers()
    .then(function(players){
        for(var i = 0; i < players.length; i++) {
            if(!player[i].ready) return false;
        }
        return true;
    })
}

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


mongoose.model('Game', gameSchema);






// gameSchema.methods.runBelts = function(type) { //type is 1 or 2. 1 = all
//   return this.getPlayerTiles().bind(this)
//   .then(function(playersWithTile){
//     return Promise.map(playersWithTile, function(p){
//       if (p.tile.conveyor && p.tile.conveyor.magnitude >=type){
//         var conveyor = p.tile.conveyor;
//         return Player.findById(p._id)
//         .then(function(p){
//           return p.boardMove(conveyor.bearing);
//         })

//       }
//     });
//   })
//   .then(function(players){
//     return this.checkPostBeltLocs(type);
//   });
// };


// gameSchema.methods.checkPostBeltLocs = function (type, prevloc){
//   return this.getPlayerTiles()
//   .then(function(playersWithTile){
//     return Promise.map(playersWithTile, function(p){
//       if (p.tile.conveyor && p.tile.conveyor.magnitude >=type){
//         if (p.tile.conveyor.type === 'clockwise') return p.rotate(90);
//         else if(p.tile.conveyor.type === 'counterclock') return p.rotate(-90);
//         // 'merge1CCW', 'merge1CW', 'merge2'
//         // else if(p.tile.conveyor.type === ''){} DON'T KNOW WHAT TO DO WITH THIS
//       }
//       else if (p.tile.floor === 'pit' || !p.tile){
//         return p.loseLife();
//       }
//     })
//   })
// }



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
