app.controller('GameCtrl', function($scope, $state, theGame){

	// window.start()
  $scope.game = theGame;
  $scope.boardObj = $scope.game.board

  function collectOneCol(n){
    var key = 'col' + n.toString();
    var idents = $scope.boardObj[key].map(function(tile){
      return tile.identifier;
    });
    return idents;
  }

  $scope.board = [];
  for(var i = 11; i >= 0; i --){
    $scope.board.push(collectOneCol(i));
  }


});
