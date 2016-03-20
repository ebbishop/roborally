var Promise = require('bluebird');
var mongoose = require('mongoose');

function boardMove (players) {

  moveExpressBelts();

}

function moveExpressBelts (players){  // array of players
  return Promise.map(players, function (player){
    var me = player;
    return player.findMyTile()
    .then(function (tile){
      if (tile.conveyor && tile.conveyor.magnitude === 2){
        var newLocation = getNewLocation(me, direction, 1)
        player.set('location', newLocation);
        return player.save()
      }
    });
  })
  .then(function(players){
    // send locations of all players?
  })
}



function moveAllBelts (){

}

function pushersPush () {

}

function moveGears (){

}

function fireLasers(){

}

function getNewLocation (player, direction, magnitude){
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

function checkNewLocation (){

}
