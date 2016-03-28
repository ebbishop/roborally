app.factory('PlayerFactory', function($http) {

	var PlayerFactory = {};

	PlayerFactory.createPlayer = function(data, id) {
		return $http.post('/api/player/', {params:{"data": data, "id": id}})
		.then(function(res) {
			return res.data
		})
	}

	return PlayerFactory

})