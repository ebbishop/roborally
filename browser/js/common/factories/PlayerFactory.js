app.factory('PlayerFactory', function($http) {

	var PlayerFactory = {};

	PlayerFactory.getPlayer = function(playerId) {
		return $http.get('/api/player/' + playerId)
		.then(function(res) {
			return res.data
		})
	}

	PlayerFactory.createPlayer = function(data, id) {
		return $http.post('/api/player/', {params:{"data": data, "id": id}})
		.then(function(res) {
			return res.data
		})
	}

	PlayerFactory.sendRegister = function(register, gameId, playerId) {
		return $http.put('/api/player/', {params:{"register": register, "gameId": gameId, "playerId": playerId}})
	}

	return PlayerFactory

})