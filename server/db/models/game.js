var mongoose = require('mongoose');
var Promise = require('bluebird');


var schema = new mongoose.Schema({
  board: mongoose.Schema.Type.ObejctId,
  active: {
    type: Boolean,
    default: true
  },
  state: {
    type: String,
    enum: ['decision', 'run'],
  },
  deck: {default: newDeck}, //don't think this is valid
});

mongoose.model('Game', schema);

schema.method.toggleState = function(argument) {
  // body...
}

schema.method.dealCards = function(){
    // splice cards from this.deck
    // send to players where {game: this._id}
}

var newDeck = [
    {name: 'U-Turn', rotation: 180, forward: 0, magnitude: 0, priority: 10},
    {name: 'U-Turn', rotation: 180, forward: 0, magnitude: 0, priority: 20},
    {name: 'U-Turn', rotation: 180, forward: 0, magnitude: 0, priority: 30},
    {name: 'U-Turn', rotation: 180, forward: 0, magnitude: 0, priority: 40},
    {name: 'U-Turn', rotation: 180, forward: 0, magnitude: 0, priority: 50},
    {name: 'U-Turn', rotation: 180, forward: 0, magnitude: 0, priority: 60},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 70},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 90},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 110},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 130},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 150},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 170},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 190},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 210},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 230},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 250},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 270},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 290},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 310},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 330},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 350},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 370},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 390},
    {name: 'Rotate Left', rotation: -90, forward: 0, magnitude: 0, priority: 410},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 80},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 100},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 120},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 140},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 160},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 180},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 200},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 220},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 240},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 260},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 280},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 300},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 320},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 340},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 360},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 380},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 400},
    {name: 'Rotate Right', rotation: 90, forward: 0, magnitude: 0, priority: 420},
    {name: 'Back Up', rotation: 0, forward: 1, magnitude: 1, priority: 430},
    {name: 'Back Up', rotation: 0, forward: 1, magnitude: 1,priority: 440},
    {name: 'Back Up', rotation: 0, forward: 1, magnitude: 1,priority: 450},
    {name: 'Back Up', rotation: 0, forward: 1, magnitude: 1,priority: 460},
    {name: 'Back Up', rotation: 0, forward: 1, magnitude: 1,priority: 470},
    {name: 'Back Up', rotation: 0, forward: 1, magnitude: 1,priority: 480},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 490},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 500},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 510},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 520},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 530},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 540},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 550},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 560},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 570},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 580},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 590},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 600},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 610},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 620},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 630},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 640},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 650},
    {name: 'Move 1', rotation: 0, forward: 1, magnitude: 1, priority: 660},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 670},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 680},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 690},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 700},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 710},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 720},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 730},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 740},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 750},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 760},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 770},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 780},
    {name: 'Move 2', rotation: 0, forward: 1, magnitude: 2, priority: 790},
    {name: 'Move 3', rotation: 0, forward: 1, magnitude: 3, priority: 800},
    {name: 'Move 3', rotation: 0, forward: 1, magnitude: 3, priority: 810},
    {name: 'Move 3', rotation: 0, forward: 1, magnitude: 3, priority: 820},
    {name: 'Move 3', rotation: 0, forward: 1, magnitude: 3, priority: 830},
    {name: 'Move 3', rotation: 0, forward: 1, magnitude: 3, priority: 840},
  ];


schema.method.initializeGame = function(){
  // may make more sense to make this in a separate module
  return this.update({deck: newDeck}).save()
}
