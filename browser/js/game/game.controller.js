app.controller('GameCtrl', function($scope, $state, theGame, $q, thePlayer, FirebaseFactory, GameFactory){

	$scope.game = theGame;
	$scope.player = thePlayer

	$scope.fbPlayers = FirebaseFactory.getConnection($scope.game._id + '/game' + '/players')
	// console.log('these are the players: ', $scope.fbPlayers)

	$scope.$watch('fbPlayers', function(players) {
		for(var key in players) {
			if(players.hasOwnProperty(key) && key[0] !== '$'){
				if (!players[key].ready) return
			}
		}
		if(players[0]) {
			console.log("all players are ready - before startRound");
			return GameFactory.startRound($scope.game._id)
			.then(function(response) {
				console.log('respone after startRound: ', response);
			})
		}
		else {
			console.log('NOT all players are ready');
		}
	}, true);


	$scope.boardObj = $scope.game.board;
	$scope.docks = $scope.game.board.dockLocations;
	$scope.lasers = $scope.game.board.laserLocations;

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

	// function getWallsInRow(row) {
	// 	var wallsArrPositions = [];
	// 	var wallIdentifiers = [2, 8, 9, 37, 85, 90, 94, 98];
	// 	for(var i = 0; i < $scope.board[row]; i++) {
	// 		console.log('scopeboardrow', $scope.board[row])
	// 		if(wallIdentifiers.indexOf($scope.board[row][i]) > -1) wallsArrPositions.push(i);
	// 	}
	// 	return wallsArrPositions;
	// }

	var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

	loader
  	.add("img/spritesheet.json")
  	.load(setup);

	var id = PIXI.loader.resources["img/spritesheet.json"].textures;

  var imgSizeActual = 150;
	var imgScale = 3;
	var imgSize = imgSizeActual/imgScale

	function setup() {

	    var stage = new Container();
	    var renderer = autoDetectRenderer(imgSize*16,imgSize*12);
	    document.getElementById("board-container").appendChild(renderer.view)


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
      if(!$scope.lasers) return;
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

		var robotHash = {};
		window.robots = robotHash
		$scope.nextPhase = 0;
		var phases = new Firebase("https://gha-roborally.firebaseio.com/" + $scope.game._id + '/phases')
		phases.on('value', function(data) {

			var phases = JSON.parse(data.val())
			console.log('this is the data in phases ', phases)

			if(Object.keys(robotHash).length === 0) drawRobots(phases.slice($scope.nextPhase))
			runOneRegister(phases.slice($scope.nextPhase));
			$scope.nextPhase = phases.length;

			if(!$scope.$$phase){
				$scope.$digest();
			}
		});

		function drawRobots(initial) {
			initial[0].players.forEach(function(player, idx){
				if(robotHash[player.name] === undefined) createSprite();

				function createSprite() {
					console.log('creating sprite for', player)
					var robotImg = robotImage(player.robot);
					var robot = new Sprite(resources["img/spritesheet.json"].textures[robotImg])
					// var robot = new Sprite(PIXI.Texture.fromImage(robotImg))
					//anchoring the roation to the at the center of the sprite which is why we offset the position by 0.5 as well
					robot.anchor.x = 0.5;
					robot.anchor.y = 0.5;
					robot.position.x = imgSize*(player.position[0] + 0.5);
	        robot.position.y = imgSize*(11-player.position[1] + 0.5);
	        robot.scale.set(1/imgScale, 1/imgScale);

			      	stage.addChild(robot);
			      	robotHash[player.name] = robot;
			      	robotHash[player.name].bearing = player.bearing;
			      	robotHash[player.name].location = player.position;
			      	renderer.render(stage)
				}
			})
		}

		function runOneRegister (register) {
			var registerArr = [];
			register.forEach(function(playerMove){
				registerArr.push(playerMove.players);
			});
			console.log('regist', registerArr);
			console.log('flattened register', _.flatten(registerArr))
			// console.log('flattened register', _.flatten(register))
			move(_.flatten(registerArr));
		}

		function move(playerObjs) {
			return playerObjs.reduce(function(acc, player, idx){
				var robot = robotHash[player.name];
				var turn = false;
				var compass;
				var particle;

				return acc.then(function() {
					return turnRobot()
				})
				.then(function() {
					return promiseForMoveRobot();
				})
				.then(function() {
					robot.location = player.position;
					return shootRobotLasers();
				})
				.then(function() {
					// console.log(robotHash)
					stage.removeChild(particle);
					renderer.render(stage)
				})

				function turnRobot() {
					if(player.bearing[0] !== robot.bearing[0] || player.bearing[1] !== robot.bearing[1]) {
						var radians = getRotation(robot.bearing, player.bearing);
						var amtToRotate = radians + robot.rotation
						robot.bearing = player.bearing;
						var direction; //clockwise or counterclockwise

						turn = true;
						return promiseForRotate();

						function promiseForRotate () {
							return $q(function(resolve, reject){
								rotate(resolve);
							})
						}

						function rotate(resolve) {
							if(robot.rotation <= amtToRotate && direction == "clockwise" || direction == undefined) {
								console.log('turning clockwise')
								direction = "clockwise";
								robot.rotation += 0.03;
								requestAnimationFrame(rotate.bind(null, resolve));
							}	else if(robot.rotation >= amtToRotate) {
								console.log('turning counter clockwise');
								direction = "counterclockwise";
								robot.rotation -= 0.03;
								requestAnimationFrame(rotate.bind(null, resolve));
							}	else {
								resolve();
							}
						}
					} else {
						return $q.resolve();
					}
				}

				function promiseForMoveRobot(){
					return $q(function(resolve, reject){
						moveRobot(resolve);
					});
				}

				function moveRobot(resolve) {
					var row = player.position[0] + 0.5;
					var col = 11-player.position[1] + 0.5;
					if(robot.location[0] > player.position[0]) compass = 'north';
					else if(robot.location[0] < player.position[0]) compass = 'south';
					else if(robot.location[1] < 11-player.position[1]) compass = 'east';
					else if(robot.location[1] > 11-player.position[1]) compass = 'west'

					if(!turn && robot.position.x >= imgSize * row && compass == 'north') {
				        requestAnimationFrame(moveRobot.bind(null, resolve));
				        robot.position.x -= 1;
				  	}
				  	else if(!turn && robot.position.x <= imgSize * row && compass == 'south') {
				  		requestAnimationFrame(moveRobot.bind(null, resolve));
				  		robot.position.x += 1;
				  	}
				  	else if(!turn && robot.position.y >= imgSize * col && compass == 'east') {
				  		requestAnimationFrame(moveRobot.bind(null, resolve));
				  		robot.position.y -= 1;
				  	}
				  	else if(!turn && robot.position.y <= imgSize * col && compass == 'west') {
				  		requestAnimationFrame(moveRobot.bind(null, resolve));
				  		robot.position.y += 1;
				  	}
				  	else {
				  		resolve();
				  	}
				}

				function shootRobotLasers() {
					var offset;
					var myReq;

					if(player.bearing[0] !== 0) particle = new Sprite(resources["img/spritesheet.json"].textures['robolaser-h.png'])
					else particle = new Sprite(resources["img/spritesheet.json"].textures['robolaser-v.png'])

					// if(player.bearing[0] !== 0) particle = new Sprite(PIXI.Texture.fromImage('/img/robolaser-h.png'))
					// else particle = new Sprite(PIXI.Texture.fromImage('/img/robolaser-v.png'))


					particle.position.x = imgSize*(player.position[0] + 0.5 + player.bearing[0]) - 5;
	        particle.position.y = imgSize*(11-player.position[1] + 0.5 - player.bearing[1]) - 5;
	        particle.scale.set(1/imgScale, 1/imgScale);

	      	stage.addChild(particle);
	      	renderer.render(stage)


	      	return promiseForShooting()


					function promiseForShooting () {
						return $q(function(resolve, reject){
							shoot(resolve)
						})
					}

					function shoot(resolve) {
						if(!particle) return;
						if(player.bearing[0] === -1 && particle.position.x >= 0) {
				        requestAnimationFrame(shoot.bind(null, resolve));
				        particle.position.x -= 10;
					  	}
					  	else if(player.bearing[0] === 1 && particle.position.x <= imgSize*rows) {
					  		requestAnimationFrame(shoot.bind(null, resolve));
					  		particle.position.x += 10;
					  	}
					  	else if(player.bearing[1] === 1 && particle.position.y >= 0) {
					  		requestAnimationFrame(shoot.bind(null, resolve));
					  		particle.position.y -= 10;
					  	}
					  	else if(player.bearing[1] === -1 && particle.position.y <= imgSize*cols) {
					  		requestAnimationFrame(shoot.bind(null, resolve));
					  		particle.position.y += 10;
					  	} else  {
					  		resolve();
					  	}
					}
				}

			}, $q.resolve())
		}

		buildTiles();
		drawDocks();
		drawDockLine();
		drawLasers();
		// drawRobots(players);
		// runOneRegister(oneRegister)

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
	return robotName.toLowerCase().replace(/ /g,'') + 'Arrow.png';
}

function getRotation (orig, next){
	if(orig[0] + next[0] ===  0 || orig[1] + next[1] === 0) return Math.PI;
	else {
	  var dot = -orig[0]*next[1] + orig[1]*next[0];
	  var rad = Math.asin(dot);
  	return rad;
	}
}
