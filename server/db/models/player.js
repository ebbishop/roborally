var mongoose = require('mongoose');

var robots = ['Zoom Bot', 'Spin Bot', 'Twonky', 'Squash Bot', 'Trundle Bot', 'Hulk x90', 'Hammer Bot', 'Twitch'];

var robotSchema = new mongoose.Schema({
  name: {type: String, enum: robots, required: true},
  story: {type: String},
  imgUrl: String
});

var playerSchema = new mongoose.Schema({
  game: mongoose.Schema.Type.ObjectId,
  name: String,
  robot: robotSchema,
  livesRemaining: Number,
  damage: Number,
  hand: [mongoose.Schema.Type.ObjectId], //array of up to 9 cards
  register: [mongoose.Schema.Type.ObjectId], //
  active: {type: Boolean, default: false}, //false if powered down
  ready: {type: Boolean, default: false}
});

// updates player's own 'ready' status and checks all others in the same game
playerSchema.method.iAmReady = function(register){
  var myGame = this.game;
  var player = this;
  return player.update({ready: true, register: register}).save()
  .then(function(player){
    return mongoose.model('Player').find({game: myGame})
  })
  .then(function(players){
    return Promise.map(players, function(player){
      return player.ready;
    });
  })
  .then(function(readys){
    if(readys.indexOf(false)>0) return false
    return true;
  });
};

playerSchema.method.damamaged = function(hits){
  // add to damage points
}


playerSchema.method.dealCards = function(gameId){
  var deck
  mongoose.model('Game').findById(this.game)
  .then(function(game){

  })


  mongoose.model('Player').find({game: this._id})
  .then(function(players){
    // array of players
    return Promise.map(players, function(player){
      var playerCards = deck.splice(0,9-player.damage);

      return player.set({currentHand: playerCards}).save();
    });
  })
  .then(function(players){

  });
};

mongoose.model('Player', playerSchema);
