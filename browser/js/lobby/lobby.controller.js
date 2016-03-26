app.controller("LobbyController", function($scope, FirebaseFactory) {

	var testkey = '1234'

	$scope.localConnection = FirebaseFactory.getConnection(testkey + '/game')

	$scope.games = ["game1", "game2", "game3", "game4"]

	$scope.info = ['game1 info', 'game2 info', 'game3 info', 'game4 info']

})