app.controller("LobbyController", function($scope, FirebaseFactory) {

	var allGames = FirebaseFactory.getBase()
	$scope.games = allGames
	// console.log('FULL GAME', $scope.games)
	// console.log('KEYS', Object.keys($scope.games))


});