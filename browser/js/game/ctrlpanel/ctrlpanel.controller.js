app.controller('CtrlPanelCtrl', function($scope, $stateParams, FirebaseFactory, PlayerFactory){
  $scope.gameId = $stateParams.gameId;
	$scope.playerId = $stateParams.playerId;
	console.log('CTRLPANEL', $scope.playerId, $scope.gameId);

  $scope.fbPlayer = FirebaseFactory.getConnection($scope.gameId + '/game/' + $scope.playerId);
  console.log('CtrlPanelCtrl PLAYER', $scope.fbPlayer);
  // $scope.register
  // $scope.clickedCard = function(card){

  // }
  $scope.register = [100, 340, 720, 10, 200];

  $scope.sendRegister = function() {
    console.log('sending register', $scope.register, $scope.gameId, $scope.playerId);
    return PlayerFactory.sendRegister($scope.register, $scope.gameId, $scope.playerId)
    .then(function(response) {
      console.log('send register response:' ,response)
    })
  }



})