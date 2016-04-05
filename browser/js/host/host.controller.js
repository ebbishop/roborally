app.controller("HostController", function($scope, game, $stateParams, FirebaseFactory, GameFactory, $state, PlayerFactory) {

	var gameID = $stateParams.id
	var hostID = $stateParams.hostId

	var localGamePlayers = FirebaseFactory.getConnection(gameID + '/game' + '/players')
	$scope.players = localGamePlayers

	$scope.robots = [{name: "Hammer Bot", imgUrl: "/img/robots/hammerbot.png"}, {name: "Spin Bot", imgUrl: "/img/robots/spinbot.png"}, {name: "Twonky", imgUrl: "/img/robots/twonky.png"}, {name: "Zoom Bot", imgUrl: "/img/robots/zoombot.png"}];
	$scope.game = game


	PlayerFactory.getPlayer(hostID)
	.then(function(host){
		$scope.host = host;
		$scope.robotImageUrl = $scope.robotImage(host.robot);
	});

  $scope.robotImage = function (robotName) {
    return '/img/robots/' + robotName.toLowerCase().replace(/ /g,'') + '.png';
  };

	$scope.startGame = function() {
		return GameFactory.startGame(gameID)
		.then(function(response) {
			console.log('this is the response', response)
			//we need to call intialize game function here to set the docks
			//initial position should also be the dock position
			$state.go('game', {gameId: response, playerId: hostID})
		});
	};

});