app.controller("LobbyController", function($scope, FirebaseFactory) {

	var testkey = '56f88fcc06f200af25a0a5f9'
	
	var allGames = FirebaseFactory.getBase()
	$scope.games = allGames
	console.log(allGames)

})