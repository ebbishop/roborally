app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: "HomeCtrl"
    });
});

app.controller("HomeCtrl", function($scope, $state) {

	$scope.stateTransfer = function() {
		$state.go('lobby')
	}
});