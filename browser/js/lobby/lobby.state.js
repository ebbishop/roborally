app.config(function($stateProvider){
	$stateProvider.state('lobby', {
		url: '/lobby',
		controller: 'LobbyController',
		templateUrl: 'js/lobby/lobby.html',
		resolve: {
			boards: function(BoardFactory) {
				return BoardFactory.getAllBoards()
			}
		}
	})
})