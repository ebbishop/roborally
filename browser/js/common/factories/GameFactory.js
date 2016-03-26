app.factory('GameFactory', function($http){
	
	var GameFactory = {};

	GameFactory.getGame = function(gameId){
		return $http.get('/api/game/' + gameId)
		.then(function(res){
		  	return res.data;
		});
	}

	return GameFactory;
})