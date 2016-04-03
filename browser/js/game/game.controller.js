app.controller('GameCtrl', function($scope, theGame, thePlayer, PixiFactory, RobotFactory, MoveFactory, $rootScope){

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
		PixiFactory.drawDocks($scope.game.board.dockLocations, pixi.stage)
		PixiFactory.drawDockLine(pixi.stage)

	}

	function renderAnimations() {
		pixi.renderer.render(pixi.stage);
		requestAnimationFrame(renderAnimations);
	}

	if($scope.game) {
		renderAnimations();
	}

	var phases = new Firebase("https://gha-roborally.firebaseio.com/" + $scope.game._id + '/phases')
	phases.on('value', function(data) {

		var phases = JSON.parse(data.val())
		console.log('this is the data in phases ', phases)

		if(Object.keys(robotHash).length === 0) RobotFactory.createAllRobotSprites(phases[0], robotHash, pixi);
		else MoveFactory.runOneRegister(phases);

	});

});

app.factory('RobotFactory', function($rootScope) {
	function getRobotImage(robotName) {
		return robotName.toLowerCase().replace(/ /g,'') + 'Arrow.png';
	};
	
	function createOneRobotSprite(player, robotHash, pixi) {
		var robotImg = getRobotImage(player.robot);
		var robot = new PIXI.Sprite(PIXI.loader.resources["img/spritesheet.json"].textures[robotImg]);
		robot.anchor.x = 0.5;
		robot.anchor.y = 0.5;
		robot.position.x = $rootScope.imgSize*(player.position[0] + 0.5);
        robot.position.y = $rootScope.imgSize*(11-player.position[1] + 0.5);
        robot.scale.set(1/$rootScope.imgScale, 1/$rootScope.imgScale);

      	pixi.stage.addChild(robot);
      	robotHash[player.name] = robot;
      	robotHash[player.name].bearing = player.bearing;
      	robotHash[player.name].location = player.position;
      	pixi.renderer.render(pixi.stage)

      	//reminder to add in the rotation if the robots bearing is not north
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
	N 		S
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



app.factory('PlayFactory', function(){
	return {
		runOneRegister: function(){

		}
	}
});

app.factory('MoveFactory', function(){
	return {	
		moveRobot: function(){

		},
		turnRobot: function(){

		},
		shootRobotLasers: function(){

		}
	}
})