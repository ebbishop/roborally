app.controller('GameCtrl', function($scope, $state, theGame, $q){

	$scope.game = theGame;
	$scope.boardObj = $scope.game.board
	$scope.docks = $scope.game.board.dockLocations
	$scope.lasers = $scope.game.board.laserLocations
	// console.log($scope.lasers)
	function collectOneCol(n){
	var key = 'col' + n.toString();
	var idents = $scope.boardObj[key].map(function(tile){
	  return tile.identifier;
	});
	return idents;
	}

	$scope.board = [];
	for(var i = 0; i <= 11; i ++){
		$scope.board.push(collectOneCol(i));
	}
	// console.log($scope.docks)

	var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

	loader
  	.add("img/spritesheet.json")
  	.load(setup);

  	var id = PIXI.loader.resources["img/spritesheet.json"].textures; 
    var imgSizeActual = 150 
	var imgScale = 4
	var imgSize = imgSizeActual/imgScale

	function setup() {

	    var stage = new Container();
	    var renderer = autoDetectRenderer(imgSize*16,imgSize*12);
	    document.getElementById("boardContainer").appendChild(renderer.view)


		//factor to rescale images by. This number can be changed
		var cols = 12;
		var rows = 16;

		function drawDockLine() {
		  var line = new PIXI.Graphics;
		  line.lineStyle(4, 0x000000, 1);
		  line.moveTo(12*imgSizeActual/imgScale, 0)
		  line.lineTo(12*imgSizeActual/imgScale, 12*imgSizeActual/imgScale)

		  stage.addChild(line)
		}

		function buildTiles() {
		  for (var col = 0; col < cols; col ++){
		    for (var row = 0; row < rows; row ++){
		      var tileSrc = $scope.board[col][row] + '.jpg';
		                                                          //150x150 is the actual image size
		      var tile = new Sprite(resources["img/spritesheet.json"].textures[tileSrc]);
		      
		      tile.position.x = imgSize*row
		      tile.position.y = imgSize*cols - imgSize - imgSize * col;
		      //rescales the 150px tile image to be 4 times smaller 
		      tile.scale.set(1/imgScale, 1/imgScale);

		      stage.addChild(tile)
		    }
		  }
		}
		function drawDocks() {
			for(var i = 0; i < $scope.docks.length; i++) {
				var dockNum = i+1;
				var dock = new PIXI.Text(dockNum.toString(), {font : '24px Arial', fill : 0x000000, align : 'center'})
				dock.position.x = $scope.docks[i][0]*imgSize + 13;
				dock.position.y = $scope.docks[i][1]*imgSize + 5;
				stage.addChild(dock);
			}
		}

		function drawLasers() {
			for(var i = 0; i < $scope.lasers.length; i++) {
				var line = new PIXI.Graphics;
				var xFrom, yFrom, xTo, yTo;
				if($scope.lasers[i][3] === "h" && $scope.lasers[i][0][0] > $scope.lasers[i][i][1][0]) {
					xFrom = $scope.lasers[i][0][0] 
					yFrom = $scope.lasers[i][0][1] + 0.5
					xTo = $scope.lasers[i][1][0] 
					yTo = $scope.lasers[i][1][1] + 0.5
				}
				else if($scope.lasers[i][3] === "h") {
					xFrom = $scope.lasers[i][0][0] 
					yFrom = $scope.lasers[i][0][1] + 0.5
					xTo = $scope.lasers[i][1][0] 
					yTo = $scope.lasers[i][1][1] + 0.5
				}
				else if($scope.lasers[i][3] === "v" && $scope.lasers[i][0][1] > $scope.lasers[i][1][1]) {
					xFrom = $scope.lasers[i][0][0] + 0.5
					yFrom = $scope.lasers[i][0][1] 
					xTo = $scope.lasers[i][1][0] + 0.5
					yTo = $scope.lasers[i][1][1] 
				}
				else {
					xFrom = $scope.lasers[i][0][0] + 0.5
					yFrom = $scope.lasers[i][0][1] 
					xTo = $scope.lasers[i][1][0] + 0.5
					yTo = $scope.lasers[i][1][1] 
				}

				line.lineStyle(1, 0xff0000)
				line.moveTo(xFrom*imgSize, yFrom*imgSize)
				line.lineTo(xTo*imgSize, yTo*imgSize)

				stage.addChild(line)
			    
			}
		}


		var player1, player2, player3;
		//seed for original location
		var players = [
		  { name: "player3", location: [14,3], bearing: [-1, 0], robot: "Twonky", priorityVal: null },
		  { name: "player1", location: [14,5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: null },
		  { name: "player2", location: [14,8], bearing: [-1, 0], robot: "Spin Bot", priorityVal: null },
		]

		//seed for second location
		var playerCardMove = [
		  { name: "player3", location: [15,3], bearing: [-1, 0], robot: "Twonky", priorityVal: 800 },
		  { name: "player1", location: [12,5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: 500 },
		  { name: "player2", location: [11,8], bearing: [-1, 0], robot: "Spin Bot", priorityVal: 200 },
		]

		var playerBoardMove = [
			// { name: "player3", location: [15,4], bearing: [-1, 0], robot: "Twonky", priorityVal: 800 }
			// { name: "player1", location: [12,5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: 500 },
			{ name: "player2", location: [10,8], bearing: [-1, 0], robot: "Spin Bot", priorityVal: 200 }
		]

				/* bearings

				[-1,0] N
				[0, 1] E
				[0, -1] W
				[1, 0] S

				*/

		var robotHash = {};

		function drawRobots(initial) {
			initial.forEach(function(player, idx){
				if(robotHash[player.name] === undefined) createSprite();

				function createSprite() {
					var robotImg = robotImage(player.robot);
					var robot = new Sprite(resources["img/spritesheet.json"].textures[robotImg])
					robot.position.x = imgSize*player.location[0];
			        robot.position.y = imgSize*player.location[1];
			        robot.scale.set(1/imgScale, 1/imgScale);

			      	stage.addChild(robot);
			      	robotHash[player.name] = robot;
			      	robotHash[player.name].bearing = player.bearing;
			      	renderer.render(stage)
				}	
			})
				console.log('robohash', robotHash)
		}

		function move(playerObjs) {
			playerObjs.reduce(function(acc, player, idx){
				var robot = robotHash[player.name];
				var turn = false;
				var direction;
				// setTimeout(turnAndMove.bind(null, player), idx*.5 + 6000)

				return acc.then(function() {
					return turnAndMove()	
				});

				function turnAndMove() {
					turnRobot();
					return promiseForMoveRobot();
				}

				function turnRobot() {
					if(player.bearing[0] !== robot.bearing[0] || player.bearing[1] !== robot.bearing[1]) {
					var degreesToRotate = getRotation(robot.bearing, player.bearing);
					// console.log('player name and rad to rotate', player.name, degreesToRotate)
						var container = new Container();
						container.position.x = robot.position.x + imgSize/2
						container.position.y = robot.position.y + imgSize/2
						container.pivot.set(robot.position.x + imgSize/2, robot.position.y + imgSize/2)
						container.addChild(robot);
						container.rotation = degreesToRotate
						stage.addChild(container)
						turn = true;
					}

					renderer.render(stage);
				}

				function moveRobot(resolve) {
					if(!turn && robot.position.x >= imgSize * player.location[0] && direction == 'north' || direction == undefined) {
						direction = 'north';
				        requestAnimationFrame(moveRobot.bind(null, resolve));
				        robot.position.x -= 1;
				        renderer.render(stage);
				  	} 
				  	else if(!turn && robot.position.x <= imgSize * player.location[0]) {
				  		direction = "south";
				  		// console.log('twonky')
				  		// console.log(robot.position.x, imgSize*player.location[0])
				  		requestAnimationFrame(function() {
				  			moveRobot(resolve);
				  		});
				  		robot.position.x += 1;
				  		renderer.render(stage);
				  	}
				  	else if(!turn && robot.position.y <= imgSize * player.location[1] && direction == 'west' || direction == undefined) {
				  		direction = "west";
				  		requestAnimationFrame(function() {
				  			moveRobot(resolve);
				  		});
				  		robot.position.y += 1;
				  	} 		
				  	else if(!turn && robot.position.y <= imgSize & player.location[1] && direction == 'east' || direction == undefined) {
				  		direction = 'east';
				  		requestAnimationFrame(function() {
				  			moveRobot(resolve);
				  		});
				  		robot.position.y -= 1;
				  		renderer.render(stage);
				  	} else {
				  		resolve();
				  	} 	
				}	
				function promiseForMoveRobot(){
					return $q(function(resolve, reject){
						moveRobot(resolve);	
					});
					
				}

			}, $q.resolve())
		}

		// function boardMove(playerObjs){
		// 	playerObjs.forEach(function(player,idx){

		// 	}
		// }


		buildTiles();
		drawDocks();
		drawDockLine();
		drawLasers();
		drawRobots(players);
		move(playerCardMove);
		console.log('robots now', robotHash)
		setTimeout(function() {
			move(playerBoardMove)
		},5000);

		function buildMap(){
		  renderer.render(stage);
		  requestAnimationFrame(buildMap);
		}
		if($scope.game) {

			buildMap();
		}
	}


});

function robotImage (robotName) {
	return robotName.toLowerCase().replace(/ /g,'') + '.png';
}

function getRotation (orig, next){
	console.log('orig and next', orig, next)
	if(orig[0] + next[0] ===  0 || orig[1] + next[1] === 0) return Math.PI;
	else {
	  var dot = -orig[0]*next[1] + orig[1]*next[0];
	  console.log('dot', dot)
	  var rad = Math.asin(dot);
  	return rad;
	}
}

