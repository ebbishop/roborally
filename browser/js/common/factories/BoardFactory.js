app.factory('BoardFactory', function($http){
	return {
		getAllBoards: function() {
			return $http.get('/api/board/')
			.then(response => response.data)
		},
		getOneBoard: function(boardId) {
			return $http.get('/api/board/' + boardId)
			.then(response => response.data)
		}
	}
})