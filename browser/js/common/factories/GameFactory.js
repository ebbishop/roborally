app.factory('GameFactory', function($http){
	
	var GameFactory = {};

	GameFactory.createPlayerAndGame = function(data) {
		return $http.post('/api/game/', data)
		.then(function(res) {
			return res.data
		})
	}

	GameFactory.getGame = function(gameId){
		return $http.get('/api/game/' + gameId)
		.then(function(res){
			return res.data
		});
	}

	return GameFactory;
})