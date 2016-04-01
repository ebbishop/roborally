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
  // game: {type: mongoose.Schema.Types.ObjectId, ref: 'Game'},
  name: String,
  robot: {type: String, enum:robots},

  dock: [{type: Number, default:[15,0]}], //dock number will be assigned a position on the front-end
  position: [Number], //row & col location
  compassDirection: String, // N E S W
  bearing: {
    type: Array,
    default: [-1, 0, 'N']
  },
  livesRemaining: {type: Number, default: 3},
  damage: {type: Number, default:0},
  hand: {
    type: [Number],
    default: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  register: {
    type: [Number],
    default: [0, 0, 0, 0, 0]
  },
  active: {type: Boolean, default: false}, //false if powered down
  ready: {type: Boolean, default: false},
  flagCount: {type: Number, default: 0}
});

playerSchema.set('versionKey', false);

var moveBlocked = {
  'N': {exit: 'edgeN', enter: 'edgeS'},
  'S': {exit: 'edgeS', enter: 'edgeN'},
  'E': {exit: 'edgeE', enter: 'edgeW'},
  'W': {exit: 'edgeW', enter: 'edgeE'}
};

playerSchema.methods.playCard = function(i){
  var cardNum = this.register[i];
  var card = programCards[(cardNum/10)-1];
  this.rotate(card.rotation);
  this.cardMove(card.magnitude);
};

playerSchema.methods.rotate = function (rotation){
  var theta = 2*Math.PI*(rotation/360);

  var xi = this.bearing[1];
  var yi = this.bearing[0];

  var col = Math.round(xi * Math.cos(theta) - yi * Math.sin(theta));
  var row = Math.round(yi * Math.cos(theta) + xi * Math.sin(theta));

  if(col === -0) col = 0;
  if(row === -0) row = 0;

  var cardinal = setCardinal(row, col)

  this.set('bearing', [row, col, cardinal])
  return [row, col, cardinal]
}

function setCardinal(row, col) {
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

playerSchema.methods.boardMove = function (bearing) {
  // call when self.bearing is not relevant
  var newCol = this.position[0];
  var newRow = this.position[1];
  newCol += bearing[0];
  newRow += bearing[1];
  // check if move is possible
  // if(this.checkMove()) {
    if (newCol < 0 || newRow < 0 || newCol > 11 || newRow > 15) return this.loseLife();
    else this.set('position', [newCol, newRow]);
  // }
};

playerSchema.methods.loseLife = function() {
  this.livesRemaining--;
  if (this.livesRemaining === 0) return this.killPlayer();
  else {
    this.set('position', this.dock);
  }
};

playerSchema.methods.killPlayer = function() {
  this.position = null;
};

// playerSchema.methods.checkMove = function() {
//   var currentPosition = this.position;
//   var nextPosition = [this.position[0] + this.bearing[0], this.position[1] + this.bearing[1]]

//   var currentTile = this.game.getTileAt(currentPosition)
//   var nextTile = this.game.getTileAt(nextPosition)

//   if(currentTile[moveBlocked[this.bearing[2]]['exit']]) return false;
//   else if(nextTile[moveBlocked[this.bearing[2]]['enter']]) return false;
//   else return true;
// }

playerSchema.methods.cardMove = function (magnitude) {
  var newCol = this.position[1];
  var newRow = this.position[0];

  // var checkMove = this.checkMove()

  // if (checkMove === true) {
    while (Math.abs(magnitude) > 0) {
      newCol += this.bearing[1];
      newRow += this.bearing[0];

      magnitude += magnitude > 0 ? -1 : 1
    }

    this.position = [newRow, newCol]

  // }
}

// playerSchema.methods.checkForEdgeOrPit = function(row, col) {
//   var tile = this.game.getTileAt(row, col)
//   if (tile.floor === 'pit' || col < 0 || col > 11 || row < 0 || row > 15) return true;
//   else return false;
// }

playerSchema.methods.touchFlag = function() {
  this.flagCount++;
}

// route? <--- player clicks ready and sends cards in order
playerSchema.methods.iAmReady = function(cards) {
  this.ready = true;
  this.setRegister(cards);
}

playerSchema.methods.applyDamage = function(hitCount) {
  this.accrueDamage(hitCount);
  this.checkDamage();
}

playerSchema.methods.accrueDamage = function(hitCount) {
  this.damage += hitCount
}

playerSchema.methods.checkDamage = function() {
  if (this.damage > 9) {
    this.loseLife();
    this.damage = 0;
  }
}

// route?
// after first round, assume that we call empty register before setRegister
playerSchema.methods.setRegister = function(cards) {
  for (var i=0; i<5; i++) {
    if (this.register[i] === 0) {
      this.register[i] = cards.shift()
    };
  }
};

playerSchema.methods.emptyRegister = function() {
  var discard = this.register.slice(0, 9-this.damage);
  var keep = this.register.slice(9-this.damage);
  var zeros = Array((9-this.damage)).fill(0).slice(0,5);
  this.register = zeros.concat(keep);

  var discard = this.hand.filter(function(card){
    if(keep.indexOf(card)>-1) return false
    else return true;
  })

  return discard;
}


//potentially use to deal with pushing adjacent players?
// playerSchema.methods.oneCardMove = function(bearing) {
//   var newRow, newCol, opponent;

//   var checkMove = this.checkMove()

//   if (checkMove === true) {
//     var adjacentOpponent = this.game.getPlayerAt([this.position[0]+this.bearing[0], this.position[1]+this.bearing[1]])
//     if (adjacentOpponent) return adjacentOpponent.boardMove(this.bearing)
//     else return
//   }
// }

mongoose.model('Player', playerSchema);









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
