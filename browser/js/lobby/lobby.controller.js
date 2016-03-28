app.controller("LobbyController", function($scope, FirebaseFactory) {

	var testkey = '56f88fcc06f200af25a0a5f9'
	
	$scope.localConnection = FirebaseFactory.getBase()

	$scope.games = ["game1", "game2", "game3", "game4"]

	$scope.info = ['game1 info', 'game2 info', 'game3 info', 'game4 info']

})