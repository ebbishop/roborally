var Promise = require('bluebird');
var mongoose = require('mongoose');

var game = {};
var player = {};

game.playCard = function (i){

};



game.boardMove = function (players) {

  // AW: guessing you'll want to use bluebird to manage the asynchronicity here 
  playCards(); //one register in order of priority
  moveExpressBelts();
  moveAllBelts();
  pushPushers();
  moveGears();
  fireLasers();

};

game.sendMoveEvent = function (){

};

game.moveExpressBelts = function(players){  // array of players
  return Promise.map(players, function (player){
    var me = player;
    return player.findMyTile()
    .then(function (tile){
      if (tile.conveyor && tile.conveyor.magnitude === 2){
        var newLocation = getNewLocation(me, direction, 1)
        player.set('location', newLocation);
        return player.save() //update players with new locations
      }
    });
  })
  .then(function(players){
    // send new locations
    // check new locations
    // perform actions based on new locations
  })
  // call move all
}



game.moveAllBelts = function (players){ //array of players
  return Promise.map(players, function (player){
    var me = player;
    return player.findMyTile()
    .then(function (tile){
      if (tile.conveyor){
        var newLocation = getNewLocation(me, direction, 1)
        player.set('location', newLocation);
        return player.save() //update all players with new locations
      }
    });
  })
  .then(function(players){
    // send new locations
    // check new locations
    // perform actions based on new locations
  })


}

game.pushPushers = function () {
// do require check after moving - pit or other robot in the way?
}

game.moveGears = function (){
// require no check after moving
}

game.fireLasers = function (){
// find each laser on the board
// find direction of laser
// travel in direction of laser and either continue or apply damage
}

game.applyDamage = function (){

}

game.getNewLocation = function (player, direction, magnitude){
  if (direction === 'N'){
    return [player.location[0] - magnitude, player.location[1]];
  } else if (direction === 'E') {
    return [player.location[0], player.location[1] + magnitude];
  } else if (direction === 'S') {
    return [player.location[0] + magnitude, player.location[1]];
  } else if (direction === 'W') {
    return [player.location[0], player.location[1] - magnitude];
  }
}

game.turnConveyorCorner = function () {
  // rotates a player landing on a conveyorCorner
}

player.checkNewLocation = function (){

}

module.exports = game;
