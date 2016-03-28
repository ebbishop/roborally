app.config(function($stateProvider){
	$stateProvider.state('host', {
		url: '/host/:id/:hostId',
		templateUrl: 'js/host/host.html',
		controller: 'HostController',
		resolve: {
			game: function(GameFactory, $stateParams) {
				return GameFactory.getGame($stateParams.id)
			}
		}
	})
})