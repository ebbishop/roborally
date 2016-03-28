app.controller("WaitingRoomController", function($scope, game, $stateParams, PlayerFactory) {

	$scope.gameID = $stateParams.id

	$scope.game = game
	$scope.robots = [{name: "Spin Bot", imgUrl: "/img/robots/spinbot.jpg"}, {name: "Twonky", imgUrl: "/img/robots/twonky.jpg"}, {name: "Zoom Bot", imgUrl: "/img/robots/zoombot.jpg"}]

	$scope.CreatePlayer = function(player, gameID) {
		return PlayerFactory.createPlayer(player, $scope.gameID)
		.then(function(playerInfo) {
			console.log('this is the response', playerInfo)
			// $state.go('waitingroom', {id: gameInfo._id})
		})
	}
})