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
			console.log("firebase once")
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
		console.log('firebase listener');
		var gameStates = JSON.parse(data.val());
		if(Object.keys(robotHash).length === 0) {
			console.log('nothing in robotHash');
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
				console.log('player[key], player[key].ready', players[key], players[key].ready)
				if(!players[key].ready) return;
			}
		}
		if(players[0]){
			console.log('all players are ready - run round');
			return GameFactory.startRound($scope.game._id)
		}else{
			console.log('not all players ready yet!');
		}
	}, true);

});

app.factory('UtilsFactory', function(){
	var UtilsFactory = {};

	UtilsFactory.extractPlayerData = function(gameStatesFromFb){
		var arrOfPlayerStates = [];
		gameStatesFromFb.forEach(function(gameState){
			arrOfPlayerStates.push(gameState.players);
		});
		return arrOfPlayerStates;
	};

	UtilsFactory.arraysMatch = function (arr1, arr2){
		if(arr1.length !== arr2.length) return false;
		for (var i = 0; i < arr1.length; i ++){
			if(arr1[i]!== arr2[i]) return false
		}
		return true;
	};

	UtilsFactory.getRotation = function (orig, next){
		if(orig[0] + next[0] ===  0 || orig[1] + next[1] === 0) return Math.PI;
		else {
		  var dot = -orig[0]*next[1] + orig[1]*next[0];
		  var rad = Math.asin(dot);
	  	return rad;
		}
	}
	return UtilsFactory;
})

app.factory('RobotFactory', function($rootScope, UtilsFactory) {
	function getRobotImage(robotName) {
		return robotName.toLowerCase().replace(/ /g,'') + 'Arrow.png';
	};

	function createOneRobotSprite(player, robotHash, pixi) {
		var robotImg = getRobotImage(player.robot);
		var robot = new PIXI.Sprite(pixi.loader.resources["img/spritesheet.json"].textures[robotImg]);

		robot.anchor.x = 0.5;
		robot.anchor.y = 0.5;
		robot.position.x = $rootScope.imgSize*(player.position[0] + 0.5);
    robot.position.y = $rootScope.imgSize*(11-player.position[1] + 0.5);
    robot.scale.set(1/$rootScope.imgScale, 1/$rootScope.imgScale);

    //check bearing of player
    if(player.bearing[2]!=='N') {
    	var newRotation = UtilsFactory.getRotation([-1,0], player.bearing)
    	robot.rotation = newRotation;
    }

  	pixi.stage.addChild(robot);
  	robotHash[player.name] = robot;
  	robotHash[player.name].bearing = player.bearing;
  	robotHash[player.name].location = player.position;
  	pixi.renderer.render(pixi.stage)

	};

	var RobotFactory = {}

	RobotFactory.createAllRobotSprites = function(phase, robotHash, pixi) {
		phase.players.forEach(function(player){
			if(robotHash[player.name] === undefined) createOneRobotSprite(player, robotHash, pixi);
		})
	}

	return RobotFactory;
});



// maybe only need to call requestAnimationFrame once ever??
app.factory('PixiFactory', function($rootScope){
	var PixiFactory = {};

	/*columns rendered horizontally as the board orientation is:
		E
	N   S
		W
	*/

	function collectOneCol(colNum, boardObj){
		var key = 'col' + colNum.toString();
		var idents = boardObj[key].map(function(tile){
		  return tile.identifier;
		});
		return idents;
	}

	PixiFactory.createBoardArr = function(boardObj){
			var board = [];
			for(var i = 0; i < $rootScope.cols; i++) {
				board.push(collectOneCol(i, boardObj))
			}
			return board;
		}

	PixiFactory.drawBoard = function(board, stage) {
			for(var col = 0; col < $rootScope.cols; col++) {
				for(var row = 0; row < $rootScope.rows; row++) {
					var tileSrc = board[col][row] + '.jpg';
					var tile = PixiFactory.createTileSprite(tileSrc);
					tile.position.x = $rootScope.imgSize * row;
					tile.position.y = $rootScope.imgSize * ($rootScope.cols - 1 - col);
					tile.scale.set(1/$rootScope.imgScale, 1/$rootScope.imgScale);
					stage.addChild(tile);
				}
			}
		}

	PixiFactory.pixiInitializer = function() {
			var stage = new PIXI.Container();
			var renderer = PIXI.autoDetectRenderer($rootScope.imgSize * $rootScope.rows,  $rootScope.imgSize * $rootScope.cols)

			var loader = PIXI.loader;
			loader.add("img/spritesheet.json");

			return {
				stage: stage,
				renderer: renderer,
				loader: loader
			}
		}
	PixiFactory.createTileSprite = function(tileSrc) {
			return new PIXI.Sprite(PIXI.loader.resources["img/spritesheet.json"].textures[tileSrc]);
		}

	PixiFactory.drawDocks = function (docks, stage) {
		console.log('inside drawDocks')
		for(var i = 0; i < docks.length; i++) {
			var dockNum = i+1;
			var dock = new PIXI.Text(dockNum.toString(), {font : '24px Arial', fill : 0x000000, align : 'center'});
			dock.position.x = docks[i][0]* $rootScope.imgSize + 18;
			dock.position.y = docks[i][1]* $rootScope.imgSize + 9;
			stage.addChild(dock);
		}
	}

	PixiFactory.drawDockLine = function (stage) {
		var line = new PIXI.Graphics;
		line.lineStyle(4, 0x000000, 1);
		line.moveTo(12* $rootScope.imgSizeActual/$rootScope.imgScale, 0)
		line.lineTo(12* $rootScope.imgSizeActual/$rootScope.imgScale, 12* $rootScope.imgSizeActual/$rootScope.imgScale)
		stage.addChild(line)
	}

	return PixiFactory;
});


app.factory('MoveFactory', function(UtilsFactory, $q){
	var MoveFactory = {};



	MoveFactory.playAllMoves = function(playerStates, robotHash, pixi){
		// array of player state objects:
		// [player1inPhase1, player2inPhase1, player1inPhase2, player2inPhase2]
		return playerStates.reduce(function(acc, playerState){
			var robot = robotHash[playerState.name];

			return acc.then(function(){
				return MoveFactory.turnRobot(robot, playerState);
			})
			// .then(function(){
			// 	return MoveFactory.moveRobot();
			// })
			// .then(function(){
			// 	//sets robot location (and bearing?) so shooting will be from the right position
			// 	robot.location = player.position;
			// 	robot.bearing = player.bearing;
			// 	return MoveFactory.shootRobotLasers();
			// })
			// .then(function(){
			// 	//check out destroy later
			// 	pixi.stage.removeChild(particle);
			// 	pixi.renderer.render(pixi.stage)
			// })

		}, $q.resolve())

	};

	MoveFactory.turnRobot = function(robot, player){
		var direction;
		if(UtilsFactory.arraysMatch(player.bearing, robot.bearing)) return $q.resolve();
		else{
			var changeInRotation = UtilsFactory.getRotation(robot.bearing, player.bearing);
			var endingRotation =  changeInRotation + robot.rotation;

			if(changeInRotation > 0) direction = 'clockwise';
			else direction = 'counterclockwise';

			robot.bearing = player.bearing;
			return MoveFactory.promiseForTurnRobot(robot, endingRotation, direction)
		}
	}

	MoveFactory.promiseForTurnRobot = function(robot, endingRotation, direction){
		return $q(function(resolve, reject){
			if(robot.rotation <= endingRotation && !direction || robot.rotation <= endingRotation && direction == 'clockwise'){
				robot.rotation += 0.03;

			}else if(robot.rotation >= endingRotation){
				robot.rotation -= 0.03;

			}else{
				resolve();
			}
		})
	}

	MoveFactory.moveRobot = function(){

	}
	MoveFactory.shootRobotLasers = function(){

	}


	return MoveFactory;
});




















