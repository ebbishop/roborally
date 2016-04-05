app.factory('UtilsFactory', function(){
  var UtilsFactory = {};

  UtilsFactory.extractPlayerData = function(gameStatesFromFb){
    var arrOfPlayerStates = [];
    gameStatesFromFb.forEach(function(gameState){
      arrOfPlayerStates.push(gameState.players);
    });
    return arrOfPlayerStates.slice(arrOfPlayerStates.length-10);
  };

  UtilsFactory.arraysMatch = function (arr1, arr2){
    console.log(arr1, arr2)
    if(arr1.length !== arr2.length || arr1 === undefined || arr2 === undefined) return false;
    for (var i = 0; i < arr1.length; i ++){
      if(arr1[i]!== arr2[i]) return false
    }
    return true;
  };

  UtilsFactory.getRotation = function (orig, next){
    if(orig[0] + next[0] ===  0 || orig[1] + next[1] === 0) return Math.PI;
    else {
      var dot = -orig[0]*next[1] + orig[1]*next[0];
      var rad = Math.asin(dot);
      return rad;
    }
  }
  return UtilsFactory;
});