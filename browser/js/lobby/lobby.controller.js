app.controller("LobbyController", function($scope, FirebaseFactory) {

	var testkey = '1234'

	$scope.localConnection = FirebaseFactory.getConnection(testkey + '/game' + '/1')

})