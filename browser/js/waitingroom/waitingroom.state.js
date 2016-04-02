app.config(function($stateProvider){
	$stateProvider.state('waitingroom', {
		url: '/waitingroom/:id',
		templateUrl: 'js/waitingroom/waitingroom.html',
		controller: 'WaitingRoomController',
		resolve: {
			game: function(GameFactory, $stateParams) {
				return GameFactory.getGame($stateParams.id)
			}
		}
	})
})