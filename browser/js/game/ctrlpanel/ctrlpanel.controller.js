app.controller('CtrlPanelCtrl', function($scope, $stateParams, FirebaseFactory, PlayerFactory){

	$scope.gameId = $stateParams.gameId;
	$scope.playerId = $stateParams.playerId;
	$scope.fbPlayer = FirebaseFactory.getConnection($scope.gameId + '/game/' + $scope.playerId);
	$scope.playerHand = FirebaseFactory.getConnection($scope.gameId + '/' + $scope.playerId);

	var handArr = [];
	setTimeout(function() {

		$scope.playerHand.$loaded()
		.then(function() {
		  	for(var key in $scope.playerHand) {
				if($scope.playerHand.hasOwnProperty(key) && key[0] !== '$'){
					handArr.push($scope.playerHand[key])
				}
			}
			console.log('this is the handArr', handArr);
			$scope.cards = chop(handArr);
		})
	},500)



	$scope.sendRegister = function() {
		var register = [getCardVal(0), getCardVal(1), getCardVal(2), getCardVal(3), getCardVal(4)];
		if(register.indexOf(0) > -1) return;
		else {
			console.log('sending register', register, $scope.gameId, $scope.playerId);
			return PlayerFactory.sendRegister(register, $scope.gameId, $scope.playerId)
			.then(function(response) {
			  console.log('send register response:' ,response)
	    	})		
		}
	}
})

function getCardVal(registerNum) {
	console.log('got in getCardVal')
	return Number(document.getElementById("register").children[registerNum].getAttribute('carddata'));
}

function chop(arr){
	var cards = arr.map(function(c){
	  return programCards[(c/10)-1]
	});
	var chopped = [];
	var subArr = [];
	for (var i = 0; i < arr.length; i++){
	  subArr.push(programCards[arr[i]/10 - 1]);
	  if(subArr.length === 3){
	    chopped.push(subArr);
	    subArr = [];
	  }
	}
	return chopped;
}

var programCards = [
               { name: 'u',  priority: 10 },
               { name: 'u',  priority: 20 },
               { name: 'u',  priority: 30 },
               { name: 'u',  priority: 40 },
               { name: 'u',  priority: 50 },
               { name: 'u',  priority: 60 },
               { name: 'l', priority: 70 },
               { name: 'r',  priority: 80 },
               { name: 'l', priority: 90 },
               { name: 'r',  priority: 100 },
               { name: 'l', priority: 110 },
               { name: 'r',  priority: 120 },
               { name: 'l', priority: 130 },
               { name: 'r',  priority: 140 },
               { name: 'l', priority: 150 },
               { name: 'r',  priority: 160 },
               { name: 'l', priority: 170 },
               { name: 'r',  priority: 180 },
               { name: 'l', priority: 190 },
               { name: 'r',  priority: 200 },
               { name: 'l', priority: 210 },
               { name: 'r',  priority: 220 },
               { name: 'l', priority: 230 },
               { name: 'r',  priority: 240 },
               { name: 'l', priority: 250 },
               { name: 'r',  priority: 260 },
               { name: 'l', priority: 270 },
               { name: 'r',  priority: 280 },
               { name: 'l', priority: 290 },
               { name: 'r',  priority: 300 },
               { name: 'l', priority: 310 },
               { name: 'r',  priority: 320 },
               { name: 'l', priority: 330 },
               { name: 'r',  priority: 340 },
               { name: 'l', priority: 350 },
               { name: 'r',  priority: 360 },
               { name: 'l', priority: 370 },
               { name: 'r',  priority: 380 },
               { name: 'l', priority: 390 },
               { name: 'r',  priority: 400 },
               { name: 'l', priority: 410 },
               { name: 'r',  priority: 420 },
               { name: 'backup', priority: 430 },
               { name: 'backup', priority: 440 },
               { name: 'backup', priority: 450 },
               { name: 'backup', priority: 460 },
               { name: 'backup', priority: 470 },
               { name: 'backup', priority: 480 },
               { name: 'f1', priority: 490 },
               { name: 'f1', priority: 500 },
               { name: 'f1', priority: 510 },
               { name: 'f1', priority: 520 },
               { name: 'f1', priority: 530 },
               { name: 'f1', priority: 540 },
               { name: 'f1', priority: 550 },
               { name: 'f1', priority: 560 },
               { name: 'f1', priority: 570 },
               { name: 'f1', priority: 580 },
               { name: 'f1', priority: 590 },
               { name: 'f1', priority: 600 },
               { name: 'f1', priority: 610 },
               { name: 'f1', priority: 620 },
               { name: 'f1', priority: 630 },
               { name: 'f1', priority: 640 },
               { name: 'f1', priority: 650 },
               { name: 'f1', priority: 660 },
               { name: 'f2', priority: 670 },
               { name: 'f2', priority: 680 },
               { name: 'f2', priority: 690 },
               { name: 'f2', priority: 700 },
               { name: 'f2', priority: 710 },
               { name: 'f2', priority: 720 },
               { name: 'f2', priority: 730 },
               { name: 'f2', priority: 740 },
               { name: 'f2', priority: 750 },
               { name: 'f2', priority: 760 },
               { name: 'f2', priority: 770 },
               { name: 'f2', priority: 780 },
               { name: 'f2', priority: 790 },
               { name: 'f3', priority: 800 },
               { name: 'f3', priority: 810 },
               { name: 'f3', priority: 820 },
               { name: 'f3', priority: 830 },
               { name: 'f3', priority: 840 } ];