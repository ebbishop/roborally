app.controller("HostController", function($scope, game, $stateParams, FirebaseFactory, GameFactory, $state) {

	var gameID = $stateParams.id
	var hostID = $stateParams.hostId

	var localGamePlayers = FirebaseFactory.getConnection(gameID + '/game' + '/players')
	$scope.players = localGamePlayers

	$scope.game = game

	$scope.startGame = function() {
		return GameFactory.startGame(gameID)
		.then(function(response) {
			console.log('this is the response', response)
			//we need to call intialize game function here to set the docks
			//initial position should also be the dock position
			if(!$scope.$$phase){
				$scope.$digest();
			}
			$state.go('game', {gameId: response, playerId: hostID})
		})
	}



})