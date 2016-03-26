app.factory('FirebaseFactory', function($firebaseObject) {

	var FirebaseFactory = {};

	var baseUrl = "https://resplendent-torch-4322.firebaseio.com/";

	FirebaseFactory.getConnection = function(key) {
		var localConnection = $firebaseObject(new Firebase(baseUrl + key))
		return localConnection
	}

	return FirebaseFactory

})