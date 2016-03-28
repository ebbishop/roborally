app.controller("CreateGameController", function($scope, boards, GameFactory, $state) {

	$scope.boards = boards

	$scope.robots = [{name: "Spin Bot", imgUrl: "/img/robots/spinbot.jpg"}, {name: "Twonky", imgUrl: "/img/robots/twonky.jpg"}, {name: "Zoom Bot", imgUrl: "/img/robots/zoombot.jpg"}]

	$scope.CreateGame = function(game) {
		return GameFactory.createPlayerAndGame(game)
		.then(function(gameInfo) {
			console.log('this is the response', gameInfo)
			$state.go('waitingroom', {id: gameInfo._id})
		})
	}
})