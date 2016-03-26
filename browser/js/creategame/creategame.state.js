app.config(function($stateProvider){
	$stateProvider.state('creategame', {
		url: '/creategame',
		controller: 'CreategameController',
		templateUrl: 'js/creategame/creategame.html',
		resolve: {
			boards: function(BoardFactory) {
				return BoardFactory.getAllBoards()
			}
		}
	})
})