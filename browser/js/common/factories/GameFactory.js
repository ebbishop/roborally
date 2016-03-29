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

	GameFactory.startGame = function(gameId) {
		return $http.get('/api/game/' + gameId + '/start')
		.then(function(res) {
			return res.data
		})
	}

	GameFactory.startRound = function(gameId) {
		return $http.get('/api/game/' + gameId + '/ready')
		.then(function(res) {
			return res.data
		})
	}

	return GameFactory;
})