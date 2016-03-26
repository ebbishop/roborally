app.factory('BoardFactory', function($http){
	return {
		getBoard: function(boardId) {
			return $http.get('/api/board/' + boardId)
			.then(response => response.data)
		}
	}
})