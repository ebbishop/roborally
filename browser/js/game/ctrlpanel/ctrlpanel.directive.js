app.directive('ctrlpanel', function () {

    return {
        restrict: 'E',
        templateUrl: '/js/game/ctrlPanel/ctrlpanel.html',
        scope: {
        	game: '='
        }
    }
});