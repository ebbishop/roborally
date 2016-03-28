app.factory('FirebaseFactory', function($firebaseArray) {

	var FirebaseFactory = {};

	var baseUrl = "https://resplendent-torch-4322.firebaseio.com/";
	var baseConnection = $firebaseArray(new Firebase(baseUrl))

	FirebaseFactory.getConnection = function(key) {
		var localConnection = $firebaseArray(new Firebase(baseUrl + key))
		return localConnection
	}

	FirebaseFactory.getBase = function() {
		return baseConnection
	}

	return FirebaseFactory

})