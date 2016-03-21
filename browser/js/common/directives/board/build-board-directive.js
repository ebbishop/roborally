app.directive('buildBoard', function () {

    return {
        restrict: 'E',
        templateUrl: '/js/common/directives/board/build-board.html',
        link: function(scope, element) {
        	//this function comes from streamlined.js
        	window.start();
        }
    };

});