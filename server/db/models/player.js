var mongoose = require('mongoose');

var robots = ['Zoom Bot', 'Spin Bot', 'Twonky', 'Squash Bot', 'Trundle Bot', 'Hulk x90', 'Hammer Bot', 'Twitch'];

var robotSchema = new mongoose.Schema({
  name: {type: String, enum: robots, required: true},
  story: {type: String},
  imgUrl: String
});

var playerSchema = new mongoose.Schema({
  game: {type: mongoose.Schema.Types.ObjectId, ref: 'Game'},
  name: String,
  robot: robotSchema,
  dock: Number, //starting postion
  position: [Number], //x & y location
  livesRemaining: Number,
  damage: Number,
  hand: [mongoose.Schema.Types.ObjectId], //array of up to 9 cards not sure if this should be in the db or not
  register: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [null, null, null, null, null]
  },
  active: {type: Boolean, default: false}, //false if powered down
  ready: {type: Boolean, default: false}
});

// updates player's own 'ready' status and checks all others in the same game
playerSchema.methods.iAmReady = function(register){
  return this.set({ready: true, register: register}).save();
};

playerSchema.methods.getOpponents = function(){
  return this.model('Player')
  .find({game: this.game})
  .where({_id :{$ne: this._id}})
  .bind(this);
};

playerSchema.methods.updateHand = function(cards){
  this.set('hand', cards);
  return this.save();
};

playerSchema.methods.emptyRegister = function(){
  var newRegister = this.register;
  var damage = this.damage;
  for (var i = 0; i < 5; i ++){
    if(9 - damage > i){
      newRegister[i] = null;
    }
  }
  this.set('register', newRegister);
  return this.save();
};

playerSchema.methods.setRegister = function(cards){
  var newRegister = this.register;
  for (var i = 0; i < cards.length; i ++){
    if (newRegister[i] === null){
      newRegister[i]=cards[i];
    }
  }
  this.set('register', newRegister);
  return this.save();
}

playerSchema.methods.applyDamamage = function(hitCount){
  return this.update({$inc: {damage: hitCount}}, {new: true})
};


playerSchema.methods.dealCards = function(gameId){
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
