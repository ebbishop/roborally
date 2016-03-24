var mongoose = require('mongoose');
var firebaseHelper = require('../../firebase/firebase');
var robots = ['Zoom Bot', 'Spin Bot', 'Twonky', 'Squash Bot', 'Trundle Bot', 'Hulk x90', 'Hammer Bot', 'Twitch'];

// does this need to be its own schema?
var robotSchema = new mongoose.Schema({
  name: {type: String, enum: robots, required: true},
  story: {type: String},
  imgUrl: String
});



var playerSchema = new mongoose.Schema({
  game: {type: mongoose.Schema.Types.ObjectId, ref: 'Game'},
  name: String,
  robot: [robotSchema],

  dock: [Number], //starting postion
  position: [Number], //row & col location
  compassDirection: String, // N E S W
  bearing: {
    type: Array,
    default: [-1, 0, 'N']
  },
  livesRemaining: Number,
  damage: Number,
  hand: [Number],
  register: {
    type: [Number],
    default: [0, 0, 0, 0, 0]
  },
  active: {type: Boolean, default: false}, //false if powered down
  ready: {type: Boolean, default: false},
  flagCount: {type: Number, default: 0}
});

playerSchema.set('versionKey', false);

playerSchema.statics.initiate = function() {
  //find dock number
  //find location of dock tile
  //set start position
};

playerSchema.methods.playCard = function(i){
  var cardNum = this.register[i];
  var card = programCards[(cardNum/10)-1];

  this.rotate(card.rotation);
  this.cardMove(card.magnitude);

  // send new loc & bearing
  var gameFB = firebaseHelper.getConnection(this.game);
  gameFB.child('public').child(this._id).child('loc').set(this.position);
  gameFB.child('public').child(this._id).child('bearing').set(this.bearing);
};

playerSchema.methods.boardMove = function (bearing) {
  // call when self.bearing is not relevant
  var newCol = this.position[0];
  var newRow = this.position[1];
  newCol += bearing[0];
  newRow += bearing[1];
  // check if move is possible
  if (newCol < 0 || newRow < 0) return this.loseLife()

  else {
    this.set('position', [newCol, newRow]);
    //send to firebase
    this.save()
    .then(function(player) {
      var gameFB = firebaseHelper.getConnection(player.game);
      gameFB.child('public').child(player._id).child('loc').set(player.position)
      gameFB.child('public').child(player._id).child('bearing').set(player.bearing)
    })
  }
};

playerSchema.methods.rotate = function (rotation){
  var theta = 2*Math.PI*(rotation/360);

  var xi = this.bearing[1];
  var yi = this.bearing[0];

  var col = Math.round(xi * Math.cos(theta) - yi * Math.sin(theta));
  var row = Math.round(yi * Math.cos(theta) + xi * Math.sin(theta));

  var cardinal = this.setCardinal(row, col)

  this.set('bearing', [row, col, cardinal])
  this.save()
}

playerSchema.methods.cardMove = function (magnitude) {
  var newCol = this.position[1];
  var newRow = this.position[0];
  var player = this;

  // check that move is permitted
  return player.checkMove(player.bearing)
  .then(function(result) {
    if (result === true) {
      while(magnitude > 0){

        newCol += player.bearing[1];
        if (newCol < 0) return player.loseLife()

        newRow += player.bearing[0];
        if (newRow < 0) return player.loseLife()

        return player.checkForPit(newRow, newCol)
        .then(function(result) {
          if (result === true) {
            return player.loseLife()
          }
        })
        magnitude --;
      }

      player.set('position', [newRow, newCol]);
      return player.save()
    }
  })
  .then(function(player) {
    //check if player is on a flag
    return player.touchFlag(player.position[0], player.position[1])
  })
};

playerSchema.methods.setCardinal = function(row, col) {
  var cardinal;
  switch(true) {
    case (row===-1 && col===0):
      cardinal = 'N';
      break;
    case (row===0 && col===1):
      cardinal = 'E';
      break;
    case (row===0 && col===-1):
      cardinal = 'W';
      break;
    case (row===1 && col===0):
      cardinal = 'S';
      break;
  }
  return cardinal;
};


playerSchema.methods.getOpponents = function(){
  return this.model('Player')
  .find({game: this.game})
  .where({_id :{$ne: this._id}})
  .bind(this);
};

playerSchema.methods.boardMove = function (bearing) {
  // call when self.bearing is not relevant
  var newCol = this.position[0];
  var newRow = this.position[1];
  newCol += bearing[0];
  newRow += bearing[1];
  return
  this.set('position', [newCol, newRow]);
};

playerSchema.methods.pushPlayer = function (){
  return this.getOpponents().bind(this)
  .then(function(opponents){
    return Promise.map(opponents, function(o){
      // if
    })
  })
};

playerSchema.methods.checkMove = function(bearing) {
  var key = 'edge' + bearing[2];
  return this.findMyTile()
  .then(function(tile) {
    if (tile[key] === null) return true;
    else return false
  })
}

playerSchema.methods.cardMove = function (magnitude) {
  var newCol = this.position[1];
  var newRow = this.position[0];

  // check that move is permitted
  return this.checkMove()
  .then(function(result){
    if (result === true){

    }
  })
  .then(function(result) {
    if (result === true) {
      while(magnitude > 0){
        newCol += this.bearing[1];
        if (newCol < 0) return this.loseLife()
        newRow += this.bearing[0];
        if (newRow < 0) return this.loseLife()
        magnitude --;
      }
      this.set('position', [newRow, newCol]);
    }
  })
}



playerSchema.methods.checkForPit = function(row, col) {
  return this.findMyTile(row, col)
  .then(function(tile) {
    if (tile.floor === 'pit') return true;
    else return false;
  })
}

playerSchema.methods.touchFlag = function(row, col) {
  var player = this;
  return player.findMyTile(row, col)
  .then(function(tile) {
    if (tile.flag != null) {
      if (player.flagCount + 1 === tile.flag) {
        player.flagCount++;
        return player.save()
      }
    }
  })
  .then(function(savedPlayer) {
    return savedPlayer.checkIfWinner()
  })
  .then(function(result) {
    if (result === true) return player.gameover()
  })
}

playerSchema.methods.checkIfWinner = function() {
  var player = this;
  return mongoose.model('Game').findById(player.game)
  .then(function(game) {
    if (game.numFlags === player.flagCount) return true;
    else return false;
  })
}

playerSchema.methods.applyDamage = function(hitCount){
  var player = this;
  return player.update({$inc: {damage: hitCount}}, {new: true})
  .then(function() {
    return player.checkDamage()
  })
};

playerSchema.methods.checkDamage = function() {
  if (this.damage > 9) {
    this.set('damage', 0)
    this.save()
    .then(function(player) {
      player.loseLife()
    })
  }
}

playerSchema.methods.loseLife = function() {
  this.livesRemaining--;
  if (this.livesRemaining === 0) return this.killPlayer();
  else {
    this.set('position', this.dock);
    this.save();
  }
};

playerSchema.methods.killPlayer = function() {
  this.set('_id', null); //how should we kill players?
  this.save();
};

playerSchema.methods.gameover = function() {
  return mongoose.model('Game').findById(this.game)
  .then(function(game) {
    game.state = 'gameover';
    game.save();
  });
};

playerSchema.methods.findMyTile = function(row, col){
  var player = this;
  var row = row || player.position[0];
  var col = col || player.postion[1];

  return mongoose.model('Game').findById(player.game)
  .then(function(game){
    return mongoose.model('Board').findById(game.board);
  })
  .then(function(board){
    return board.getTileAt(row, col);
  })
  .then(function(tileId){
    return mongoose.model('Tile').findById(tileId);
  });
};

playerSchema.methods.attachMyTile = function (){
  return Game.findById(this.game).bind(this)
  .then(function(g){
    return Board.findById(g.board);
  })
  .then(function(b){
    return b.getTileAt(this.position);
  })
  .then(function(t){
    // return player with fully populated tile attached
    this.tile = t;
    return this;
  });
};

playerSchema.methods.clearHand = function() {
    var handToDiscard = this.hand;
    return mongoose.model('Game').findByIdAndUpdate(player.game,
        {$push:  {discard: {$each: handToDiscard} } } );
};

playerSchema.methods.iAmReady = function(register){
  return this.set({ready: true, register: register}).save();
};

playerSchema.methods.isPlayerReady = function() {
    return this.ready;
};

playerSchema.methods.setRegister = function(cards) { //assumes we are getting an array of cards from the front end in order
  var self = this;
  var prevRegister = this.register;

  if(self.damage < 5 && cards.length === 5) self.register = cards;
  else if(self.damage === 5 && cards.length === 4) self.register = cards.concat(prevRegister.slice(4));
  else if(self.damage === 6 && cards.length === 3) self.register = cards.concat(prevRegister.slice(3));
  else if(self.damage === 7 && cards.length === 2) self.register = cards.concat(prevRegister.slice(2));
  else if(self.damage === 8 && cards.length === 1) self.register = cards.concat(prevRegister.slice(1));
  else return;

  self.save();
};



mongoose.model('Player', playerSchema);























// // updates player's own 'ready' status and checks all others in the same game

// playerSchema.methods.updateHand = function(cards){
//   this.set('hand', cards);
//   return this.save();
// };

// playerSchema.methods.emptyRegister = function(){
//   var newRegister = this.register;
//   var damage = this.damage;
//   for (var i = 0; i < 5; i ++){
//     if(9 - damage > i){
//       newRegister[i] = null;
//     }
//   }
//   this.set('register', newRegister);
//   return this.save();
// };

// playerSchema.methods.setRegister = function(cards){
//   var newRegister = this.register;
//   for (var i = 0; i < cards.length; i ++){
//     if (newRegister[i] === null){
//       newRegister[i]=cards[i];
//     }
//   }
//   this.set('register', newRegister);
//   return this.save();
// }

// playerSchema.methods.dealCards = function(gameId){
//   var deck
//   mongoose.model('Game').findById(this.game)
//   .then(function(game){

//   })


//   mongoose.model('Player').find({game: this._id})
//   .then(function(players){
//     // array of players
//     return Promise.map(players, function(player){
//       var playerCards = deck.splice(0,9-player.damage);

//       return player.set({currentHand: playerCards}).save();
//     });
//   })
//   .then(function(players){

//   });
// };


var programCards = [
 { name: 'U-Turn',   rotation: 180,  magnitude: 0,   priority: 10 },
 { name: 'U-Turn',   rotation: 180,  magnitude: 0,   priority: 20 },
 { name: 'U-Turn',   rotation: 180,  magnitude: 0,   priority: 30 },
 { name: 'U-Turn',   rotation: 180,  magnitude: 0,   priority: 40 },
 { name: 'U-Turn',   rotation: 180,  magnitude: 0,   priority: 50 },
 { name: 'U-Turn',   rotation: 180,  magnitude: 0,   priority: 60 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 70 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 80 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 90 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 100 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 110 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 120 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 130 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 140 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 150 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 160 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 170 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 180 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 190 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 200 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 210 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 220 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 230 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 240 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 250 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 260 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 270 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 280 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 290 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 300 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 310 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 320 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 330 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 340 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 350 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 360 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 370 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 380 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 390 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 400 },
 { name: 'Rotate Left',   rotation: -90,  magnitude: 0,   priority: 410 },
 { name: 'Rotate Right',   rotation: 90,  magnitude: 0,   priority: 420 },
 { name: 'Back Up',   rotation: 0,   magnitude: -1,   priority: 430 },
 { name: 'Back Up',   rotation: 0,   magnitude: -1,   priority: 440 },
 { name: 'Back Up',   rotation: 0,   magnitude: -1,   priority: 450 },
 { name: 'Back Up',   rotation: 0,   magnitude: -1,   priority: 460 },
 { name: 'Back Up',   rotation: 0,   magnitude: -1,   priority: 470 },
 { name: 'Back Up',   rotation: 0,   magnitude: -1,   priority: 480 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 490 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 500 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 510 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 520 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 530 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 540 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 550 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 560 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 570 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 580 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 590 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 600 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 610 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 620 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 630 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 640 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 650 },
 { name: 'Move 1',   rotation: 0,   magnitude: 1,   priority: 660 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 670 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 680 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 690 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 700 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 710 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 720 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 730 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 740 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 750 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 760 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 770 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 780 },
 { name: 'Move 2',   rotation: 0,   magnitude: 2,   priority: 790 },
 { name: 'Move 3',   rotation: 0,   magnitude: 3,   priority: 800 },
 { name: 'Move 3',   rotation: 0,   magnitude: 3,   priority: 810 },
 { name: 'Move 3',   rotation: 0,   magnitude: 3,   priority: 820 },
 { name: 'Move 3',   rotation: 0,   magnitude: 3,   priority: 830 },
 { name: 'Move 3',   rotation: 0,   magnitude: 3,   priority: 840 } ];
