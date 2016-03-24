var Game = function(){
  this._id: 'a23u4sjdfslkr54po',
  this.name: 'bestGameEver',
  this.active: true,
  this.state: "decision",
  this.currentCard: 3,
  this.deck: [],
  this.discardDeck: [],
  this.numFlags: 3,
  this.board : {},
  this.players: [{},{}]
}


Game.prototype.dealCards = function() {
  var numCardsToDeal,cardsToDeal;
  var self = this;
  
  this.players.forEach(function(player){
    numCardsToDeal = 9-player.damage;

    if(numCardsToDeal > self.deck.length) {
      self.shuffleDeck()
    }
    
    cardsToDeal = self.deck.splice(0,numCardsToDeal);
    player.hand = cardsToDeal;
  });
}

Game.prototype.shuffleDeck = function() {
  var cards = this.deck.concat(this.discardDeck);
  this.deck = _.shuffle(cards);
  this.discardDeck = [];
};