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
			$state.go('game', {gameId: response, playerId: hostID})
		})
	}



})