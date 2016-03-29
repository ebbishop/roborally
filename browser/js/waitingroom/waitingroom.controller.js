app.controller("WaitingRoomController", function($scope, game, $stateParams, PlayerFactory, FirebaseFactory, $state) {

	$scope.gameID = $stateParams.id
	$scope.players = FirebaseFactory.getConnection($scope.gameID + '/game' + '/players')
	$scope.localGame = FirebaseFactory.getConnection($scope.gameID + '/game' + '/state')
	$scope.game = game
	$scope.robots = [{name: "Spin Bot", imgUrl: "/img/robots/spinbot.jpg"}, {name: "Twonky", imgUrl: "/img/robots/twonky.jpg"}, {name: "Zoom Bot", imgUrl: "/img/robots/zoombot.jpg"}]

	$scope.CreatePlayer = function(player, gameID) {
		return PlayerFactory.createPlayer(player, $scope.gameID)
		.then(function(playerInfo) {
			var id = playerInfo.playerId
			$scope.$watch('localGame.$value', function(state) {
				console.log('this is the local game', $scope.localGame.$value)
				console.log('this is state', state)
				if (state === 'decision') {
					$state.go('game', {gameId: $scope.gameID, playerId: id})
				}
			})
		})
	}



})