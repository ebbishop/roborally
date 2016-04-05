app.controller('GameCtrl', function($scope, theGame, thePlayer, PixiFactory, UtilsFactory, RobotFactory, MoveFactory, $rootScope, FirebaseFactory, GameFactory){

	$rootScope.imgSizeActual = 150;
	$rootScope.imgScale = 3;
	$rootScope.imgSize = $rootScope.imgSizeActual/$rootScope.imgScale
	$rootScope.cols = 12;
	$rootScope.rows = 16;

	$scope.game = theGame;
	$scope.player = thePlayer;

	var pixi = PixiFactory.pixiInitializer();
	var board = PixiFactory.createBoardArr($scope.game.board)
	pixi.loader.load(setup)
	var robotHash = {};

	function setup() {
		document.getElementById("board-container").appendChild(pixi.renderer.view);
		PixiFactory.drawBoard(board, pixi.stage);
		PixiFactory.drawDocks($scope.game.board.dockLocations, pixi.stage);
		PixiFactory.drawDockLine(pixi.stage);

		var initStateFromFb = new Firebase("https://fiery-inferno-1350.firebaseio.com/" + $scope.game._id + '/phases');
		initStateFromFb.once('value', function(data){
			var init = JSON.parse(data.val());
			RobotFactory.createAllRobotSprites(init[0], robotHash, pixi);
		});
	}

	function renderAnimations() {
		pixi.renderer.render(pixi.stage);
		requestAnimationFrame(renderAnimations);
	}

	if($scope.game) {
		renderAnimations();
	}

	var arrOfPlayerStates;

	// listen for data in phases in firebase
	var gameStatesFromFb = new Firebase("https://fiery-inferno-1350.firebaseio.com/" + $scope.game._id + '/phases');

	gameStatesFromFb.on('value', function(data) {
		var gameStates = JSON.parse(data.val());

		if(Object.keys(robotHash).length === 0) {
			RobotFactory.createAllRobotSprites(gameStates[0], robotHash, pixi);

		} else {
			console.log('something in robotHash, lets play  moves');
			arrOfPlayerStates = _.flatten(UtilsFactory.extractPlayerData(gameStates));
			MoveFactory.playAllMoves(arrOfPlayerStates, robotHash, pixi);
		}

	});

	// watch for changes to firebase
	$scope.arrOfPlayersFromFirebase = FirebaseFactory.getConnection($scope.game._id + '/game/players');
	$scope.$watch('arrOfPlayersFromFirebase', function(players){

		for(var key in players){ //loop through all items on firebase that are player objects (ignore fb extra info)
			if(players.hasOwnProperty(key) && key[0] !=='$'){
				if(!players[key].ready) return;
			}
		}

		if(players[0]){
			console.log('all players are ready - run round');
			return GameFactory.startRound($scope.game._id)
		}
	}, true);

});























