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


  dock: Number, //starting postion

  position: [Number], //row & col location
  compassDirection: String, // N E S W
  bearing: {
    type: [Number],
    default: [-1,0]
  },
  livesRemaining: Number,
  damage: Number,
  hand: [Number],
  register: {
    type: [Number],
    default: [0, 0, 0, 0, 0]
  },
  active: {type: Boolean, default: false}, //false if powered down
  ready: {type: Boolean, default: false}
});

playerSchema.set('versionKey', false);

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

playerSchema.methods.rotate = function (rotation){
  var theta = 2*Math.PI*(rotation/360);

  var xi = this.bearing[1];
  var yi = this.bearing[0];

  var x = Math.round(xi * Math.cos(theta) - yi * Math.sin(theta));
  var y = Math.round(yi * Math.cos(theta) + xi * Math.sin(theta));

  // this.bearing = [y,x]
  this.set('bearing', [y, x]);
};

playerSchema.methods.cardMove = function (magnitude) {
  // call when player has made decison & self.bearing is relevant
  var newCol = this.position[1];
  var newRow = this.position[0];
  while(magnitude > 0){
    newCol += this.bearing[1];
    newRow += this.bearing[0];
    // check that move is permitted
    // if move is permitted, try the next one
    // else apply
    magnitude --;
  }
  this.set('position', [newCol, newRow]);
};

playerSchema.methods.boardMove = function (bearing) {
  // call when self.bearing is not relevant
  var newCol = this.position[0];
  var newRow = this.position[1];
  newCol += bearing[0];
  newRow += bearing[1];
  // check if move is possible
  this.set('position', [newCol, newRow]);
};

playerSchema.methods.checkMove = function (){
// return true/false
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

mongoose.model('Player', playerSchema);























// playerSchema.methods.findMyTile = function(){
//   var player = this;
//   return mongoose.model('Game').findById(player.game)
//   .then(function(game){
//     return mongoose.model('Board').findById(game.board);
//   })
//   .then(function(board){
//     return board.getTileAt(player.location[0], player.location[1]);
//   })
//   .then(function(tileId){
//     return mongoose.model('Tile').findById(tileId);
//   });

// };




// // updates player's own 'ready' status and checks all others in the same game
// playerSchema.methods.iAmReady = function(register){
//   return this.set({ready: true, register: register}).save();
// };

// playerSchema.methods.getOpponents = function(){
//   return this.model('Player')
//   .find({game: this.game})
//   .where({_id :{$ne: this._id}})
//   .bind(this);
// };

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

// playerSchema.methods.applyDamamage = function(hitCount){
//   return this.update({$inc: {damage: hitCount}}, {new: true})
// };


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
 { name: 'Move 3',   rotation: 0,   magnitude: 3,   priority: 840 } ]
