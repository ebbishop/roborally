app.controller('CtrlPanelCtrl', function($scope, $stateParams, FirebaseFactory){
  $scope.gameId = $stateParams.gameId;
	$scope.playerId = $stateParams.playerId;
	console.log('CTRLPANEL', $scope.playerId, $scope.gameId);

  $scope.fbPlayer = FirebaseFactory.getConnection($scope.gameId + '/game/' + $scope.playerId);
  console.log('CtrlPanelCtrl PLAYER', $scope.fbPlayer);
  // $scope.register
  // $scope.clickedCard = function(card){

  // }

})