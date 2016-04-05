app.config(function ($stateProvider) {

    $stateProvider.state('game', {
      url: '/game/:gameId/:playerId',
      templateUrl: '/js/game/game.html',
      controller: 'GameCtrl',
      resolve: {
        theGame: function(GameFactory, $stateParams) {
          return GameFactory.getGame($stateParams.gameId);
        },
        thePlayer: function (PlayerFactory, $stateParams) {
          return PlayerFactory.getPlayer($stateParams.playerId)
        }
      }
    })
});
