app.controller('GameCtrl', function($scope, $state, theGame){

	// window.start()
  $scope.game = theGame;  
  console.log('the game', theGame)

});
