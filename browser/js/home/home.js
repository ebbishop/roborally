app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: "HomeCtrl"
    });
});

app.controller("HomeCtrl", ['$scope', '$state', 'ModalService', function($scope, $state, ModalService) {

	$scope.stateTransfer = function() {
		$state.go('lobby')
	}

	$scope.modalTransfer = function () {

		ModalService.showModal({
			templateUrl: 'js/home/instructions.html',
			controller: 'InstructionsCtrl'
		}).then(function(modal) {
			// modal.element.modal();
			modal.close.then(function(result) {
				console.log(result);
			})
		})
	}
}]);

app.controller("InstructionsCtrl", ['$scope', 'close', function($scope, close) {
	$scope.close = close;
}]);

// app.factory('myModal', function (btfModal) {
//   return btfModal({
//     controller: 'InstructionsModalCtrl',
//     controllerAs: 'modal',
//     templateUrl: 'js/home/instructions.html'
//   });
// })