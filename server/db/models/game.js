var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var firebaseHelper = require('../../firebase/firebase');
require('./board');
require('./player');


var Player = mongoose.model('Player');

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
  });
  this.currentCard ++;
};

gameSchema.methods.getPlayers = function (){
  var self = this;
  return Player.find({game: self._id})
  .then(function(players){
    return players;
  })
  .then(null, function(err){
    console.error(err);
  });
}

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
                self.set('deck', shuffledDeck);
                self.save();
            })
        }
        else {
            var shuffledDeck = _.shuffle(self.deck);
            self.set('deck', shuffledDeck);
            self.save();
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
        self.update({deck: deck.slice(numCardsToDeal)});
        return self.getPlayers()
    })
    .then(function(players){
        players.map(function(player){
            var newHand = cardsToDeal.slice(0, 9-player.damage)
            cardsToDeal = cardsToDeal.slice(9-player.damage)
            return player.update({hand: newHand})     
        })
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






gameSchema.methods.runBelts = function(type){ //type is 1 or 2. 1 = all
  var playPosition, board, tile;
  return Board.findById(board)
  .then(function(b){
    var board = b;
    return b;
  })
  .then(function(){
    return this.getPlayers()
  })
  .then(function(players){
    return Promise.map(players, function(player){
      playPosition = player.position;
      tile = board['col' + playPosition[0].toString()][playPosition[1]];
      if(tile.conveyor[0].magnitude >= type){
        player.moveOnBelt(tile.conveyor.bearing);
      }
      // check new location and perform necessary actions
    });
  });
};

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
