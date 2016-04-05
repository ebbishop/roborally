app.factory('FirebaseFactory', function($firebaseObject) {

	var FirebaseFactory = {};

	var baseUrl = "https://fiery-inferno-1350.firebaseio.com/";
	var baseConnection = $firebaseObject(new Firebase(baseUrl))

	FirebaseFactory.getConnection = function(key) {
		var localConnection = $firebaseObject(new Firebase(baseUrl + key))
		return localConnection
	}

	FirebaseFactory.getBase = function() {
		return baseConnection
	}

	return FirebaseFactory

})