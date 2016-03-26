app.config(function ($stateProvider) {

    $stateProvider.state('game', {
      url: '/game/:gameId',
      templateUrl: '/js/game/game.html',
      controller: 'GameCtrl',
      resolve: {
        theGame: function(GameFactory, $stateParams) {
          return GameFactory.getGame($stateParams.gameId);
        }
      }
    })
});