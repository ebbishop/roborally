app.controller("WaitingRoomController", function($scope, game, $stateParams, PlayerFactory, FirebaseFactory, $state) {

	$scope.gameID = $stateParams.id
	$scope.players = FirebaseFactory.getConnection($scope.gameID + '/game' + '/players')
	$scope.localGame = FirebaseFactory.getConnection($scope.gameID + '/game' + '/state')
	$scope.game = game
	$scope.robots = [{name: "Hammer Bot", imgUrl: "/img/robots/hammerbot.png"}, {name: "Spin Bot", imgUrl: "/img/robots/spinbot.png"}, {name: "Twonky", imgUrl: "/img/robots/twonky.png"}, {name: "Zoom Bot", imgUrl: "/img/robots/zoombot.png"}]

	$scope.activated = false;
	$scope.player = {name: '', imgUrl: ''};

	$scope.CreatePlayer = function(player, gameID) {
		return PlayerFactory.createPlayer(player, $scope.gameID)
		.then(function(playerInfo) {
			$scope.activated = true;
			$scope.player.name = playerInfo.name;
			$scope.player.imgUrl = player.robot.imgUrl;
			var id = playerInfo.playerId
			$scope.$watch('localGame.$value', function(state) {
				if (state === 'decision') {
					$state.go('game', {gameId: $scope.gameID, playerId: id})
				}
			})
		})
	}



})
