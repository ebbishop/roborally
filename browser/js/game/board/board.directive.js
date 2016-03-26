app.directive('board', function () {

    return {
        restrict: 'E',
        templateUrl: '/js/game/board/board.html',
        scope: {
        	game: '='
        },
        link: function(scope, element) {
        	//this function comes from streamlined.js
        	window.start();
        	// scope.game = game;
        	// console.log(game)

        }
    }

});