'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'firebase']);

app.config(function ($urlRouterProvider, $locationProvider) {
				// This turns off hashbang urls (/#about) and changes it to something normal (/about)
				$locationProvider.html5Mode(true);
				// If we go to a URL that ui-router doesn't have registered, go to the "/" url.
				$urlRouterProvider.otherwise('/');
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

				// The given state requires an authenticated user.
				var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
								return state.data && state.data.authenticate;
				};

				// $stateChangeStart is an event fired
				// whenever the process of changing a state begins.
				$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

								if (!destinationStateRequiresAuth(toState)) {
												// The destination state does not require authentication
												// Short circuit with return.
												return;
								}

								if (AuthService.isAuthenticated()) {
												// The user is authenticated.
												// Short circuit with return.
												return;
								}

								// Cancel navigating to new state.
								event.preventDefault();

								AuthService.getLoggedInUser().then(function (user) {
												// If a user is retrieved, then renavigate to the destination
												// (the second time, AuthService.isAuthenticated() will work)
												// otherwise, if no user is logged in, go to "login" state.
												if (user) {
																$state.go(toState.name, toParams);
												} else {
																$state.go('login');
												}
								});
				});
});

app.config(function ($stateProvider) {

				// Register our *about* state.
				$stateProvider.state('about', {
								url: '/about',
								controller: 'AboutController',
								templateUrl: 'js/about/about.html'
				});
});

app.controller('AboutController', function ($scope, FullstackPics) {

				// Images of beautiful Fullstack people.
				$scope.images = _.shuffle(FullstackPics);
});
app.config(function ($stateProvider) {
				$stateProvider.state('docs', {
								url: '/docs',
								templateUrl: 'js/docs/docs.html'
				});
});

app.controller("CreateGameController", function ($scope, boards, GameFactory, $state) {

				$scope.boards = boards;

				$scope.robots = [{ name: "Spin Bot", imgUrl: "/img/robots/spinbot.jpg" }, { name: "Twonky", imgUrl: "/img/robots/twonky.jpg" }, { name: "Zoom Bot", imgUrl: "/img/robots/zoombot.jpg" }];

				$scope.CreateGame = function (game) {
								return GameFactory.createPlayerAndGame(game).then(function (gameInfo) {
												console.log('this is the response', gameInfo);
												$state.go('host', { id: gameInfo._id, hostId: gameInfo.host._id });
								});
				};
});
app.config(function ($stateProvider) {
				$stateProvider.state('creategame', {
								url: '/creategame',
								controller: 'CreateGameController',
								templateUrl: 'js/creategame/creategame.html',
								resolve: {
												boards: function boards(BoardFactory) {
																return BoardFactory.getAllBoards();
												}
								}
				});
})(function () {

				'use strict';

				// Hope you didn't forget Angular! Duh-doy.
				if (!window.angular) throw new Error('I can\'t find Angular!');

				var app = angular.module('fsaPreBuilt', []);

				app.factory('Socket', function () {
								if (!window.io) throw new Error('socket.io not found!');
								return window.io(window.location.origin);
				});

				// AUTH_EVENTS is used throughout our app to
				// broadcast and listen from and to the $rootScope
				// for important events about authentication flow.
				app.constant('AUTH_EVENTS', {
								loginSuccess: 'auth-login-success',
								loginFailed: 'auth-login-failed',
								logoutSuccess: 'auth-logout-success',
								sessionTimeout: 'auth-session-timeout',
								notAuthenticated: 'auth-not-authenticated',
								notAuthorized: 'auth-not-authorized'
				});

				app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
								var statusDict = {
												401: AUTH_EVENTS.notAuthenticated,
												403: AUTH_EVENTS.notAuthorized,
												419: AUTH_EVENTS.sessionTimeout,
												440: AUTH_EVENTS.sessionTimeout
								};
								return {
												responseError: function responseError(response) {
																$rootScope.$broadcast(statusDict[response.status], response);
																return $q.reject(response);
												}
								};
				});

				app.config(function ($httpProvider) {
								$httpProvider.interceptors.push(['$injector', function ($injector) {
												return $injector.get('AuthInterceptor');
								}]);
				});

				app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

								function onSuccessfulLogin(response) {
												var data = response.data;
												Session.create(data.id, data.user);
												$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
												return data.user;
								}

								// Uses the session factory to see if an
								// authenticated user is currently registered.
								this.isAuthenticated = function () {
												return !!Session.user;
								};

								this.getLoggedInUser = function (fromServer) {

												// If an authenticated session exists, we
												// return the user attached to that session
												// with a promise. This ensures that we can
												// always interface with this method asynchronously.

												// Optionally, if true is given as the fromServer parameter,
												// then this cached value will not be used.

												if (this.isAuthenticated() && fromServer !== true) {
																return $q.when(Session.user);
												}

												// Make request GET /session.
												// If it returns a user, call onSuccessfulLogin with the response.
												// If it returns a 401 response, we catch it and instead resolve to null.
												return $http.get('/session').then(onSuccessfulLogin)['catch'](function () {
																return null;
												});
								};

								this.login = function (credentials) {
												return $http.post('/login', credentials).then(onSuccessfulLogin)['catch'](function () {
																return $q.reject({ message: 'Invalid login credentials.' });
												});
								};

								this.logout = function () {
												return $http.get('/logout').then(function () {
																Session.destroy();
																$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
												});
								};
				});

				app.service('Session', function ($rootScope, AUTH_EVENTS) {

								var self = this;

								$rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
												self.destroy();
								});

								$rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
												self.destroy();
								});

								this.id = null;
								this.user = null;

								this.create = function (sessionId, user) {
												this.id = sessionId;
												this.user = user;
								};

								this.destroy = function () {
												this.id = null;
												this.user = null;
								};
				});
})();

app.controller('GameCtrl', function ($scope, $state, theGame) {

				$scope.game = theGame;
				$scope.boardObj = $scope.game.board;
				$scope.docks = $scope.game.board.dockLocations;
				$scope.lasers = $scope.game.board.laserLocations;
				// console.log($scope.lasers)
				function collectOneCol(n) {
								var key = 'col' + n.toString();
								var idents = $scope.boardObj[key].map(function (tile) {
												return tile.identifier;
								});
								return idents;
				}

				$scope.board = [];
				for (var i = 0; i <= 11; i++) {
								$scope.board.push(collectOneCol(i));
				}
				// console.log($scope.docks)

				var Container = PIXI.Container,
				    autoDetectRenderer = PIXI.autoDetectRenderer,
				    loader = PIXI.loader,
				    resources = PIXI.loader.resources,
				    Sprite = PIXI.Sprite;

				loader.add("img/spritesheet.json").load(setup);

				var id = PIXI.loader.resources["img/spritesheet.json"].textures;
				var imgSizeActual = 150;
				var imgScale = 4;
				var imgSize = imgSizeActual / imgScale;

				function setup() {

								var stage = new Container();
								var renderer = autoDetectRenderer(imgSize * 16, imgSize * 12);
								document.getElementById("boardContainer").appendChild(renderer.view);

								//factor to rescale images by. This number can be changed
								var cols = 12;
								var rows = 16;

								function drawDockLine() {
												var line = new PIXI.Graphics();
												line.lineStyle(4, 0x000000, 1);
												line.moveTo(12 * imgSizeActual / imgScale, 0);
												line.lineTo(12 * imgSizeActual / imgScale, 12 * imgSizeActual / imgScale);

												stage.addChild(line);
								}

								function buildTiles() {
												for (var col = 0; col < cols; col++) {
																for (var row = 0; row < rows; row++) {
																				var tileSrc = $scope.board[col][row] + '.jpg';
																				//150x150 is the actual image size
																				var tile = new Sprite(resources["img/spritesheet.json"].textures[tileSrc]);

																				tile.position.x = imgSize * row;
																				tile.position.y = imgSize * cols - imgSize - imgSize * col;
																				//rescales the 150px tile image to be 4 times smaller
																				tile.scale.set(1 / imgScale, 1 / imgScale);

																				stage.addChild(tile);
																}
												}
								}
								function drawDocks() {
												for (var i = 0; i < $scope.docks.length; i++) {
																var dockNum = i + 1;
																var dock = new PIXI.Text(dockNum.toString(), { font: '24px Arial', fill: 0x000000, align: 'center' });
																dock.position.x = $scope.docks[i][0] * imgSize + 13;
																dock.position.y = $scope.docks[i][1] * imgSize + 5;
																stage.addChild(dock);
												}
								}

								function drawLasers() {
												for (var i = 0; i < $scope.lasers.length; i++) {
																var line = new PIXI.Graphics();
																var xFrom, yFrom, xTo, yTo;
																if ($scope.lasers[i][3] === "h" && $scope.lasers[i][0][0] > $scope.lasers[i][i][1][0]) {
																				xFrom = $scope.lasers[i][0][0];
																				yFrom = $scope.lasers[i][0][1] + 0.5;
																				xTo = $scope.lasers[i][1][0];
																				yTo = $scope.lasers[i][1][1] + 0.5;
																} else if ($scope.lasers[i][3] === "h") {
																				xFrom = $scope.lasers[i][0][0];
																				yFrom = $scope.lasers[i][0][1] + 0.5;
																				xTo = $scope.lasers[i][1][0];
																				yTo = $scope.lasers[i][1][1] + 0.5;
																} else if ($scope.lasers[i][3] === "v" && $scope.lasers[i][0][1] > $scope.lasers[i][1][1]) {
																				xFrom = $scope.lasers[i][0][0] + 0.5;
																				yFrom = $scope.lasers[i][0][1];
																				xTo = $scope.lasers[i][1][0] + 0.5;
																				yTo = $scope.lasers[i][1][1];
																} else {
																				xFrom = $scope.lasers[i][0][0] + 0.5;
																				yFrom = $scope.lasers[i][0][1];
																				xTo = $scope.lasers[i][1][0] + 0.5;
																				yTo = $scope.lasers[i][1][1];
																}

																line.lineStyle(1, 0xff0000);
																line.moveTo(xFrom * imgSize, yFrom * imgSize);
																line.lineTo(xTo * imgSize, yTo * imgSize);

																stage.addChild(line);
												}
								}

								var player1, player2, player3;
								//seed for original location
								var players = [{ name: "player1", location: [15, 5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: null }, { name: "player2", location: [15, 6], bearing: [-1, 0], robot: "Spin Bot", priorityVal: null }, { name: "player3", location: [14, 3], bearing: [-1, 0], robot: "Twonky", priorityVal: null }];

								//seed for second location
								var playerCardMove = [{ name: "player1", location: [15, 5], bearing: [0, 1], robot: "Hammer Bot", priorityVal: 500 }, { name: "player3", location: [13, 3], bearing: [-1, 0], robot: "Twonky", priorityVal: 800 }, { name: "player2", location: [12, 6], bearing: [-1, 0], robot: "Spin Bot", priorityVal: 200 }];

								// var playerBoardMove = [
								// 	{ name: "player3", location: [12,3], bearing: [1, 0], robot: "Twonky", priorityVal: 800 },
								// 	{ name: "player1", location: [14,5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: 500 },
								// 	{ name: "player2", location: [12, 6], bearing: [-1, 0], robot: "Spin Bot", priorityVal: 200 },
								// ]

								var robotHash = {};

								function drawRobots(initial) {
												initial.forEach(function (player, idx) {
																if (robotHash[player.name] === undefined) createSprite();

																function createSprite() {
																				var robotImg = robotImage(player.robot);
																				var robot = new Sprite(resources["img/spritesheet.json"].textures[robotImg]);
																				robot.position.x = imgSize * player.location[0];
																				robot.position.y = imgSize * player.location[1];
																				robot.scale.set(1 / imgScale, 1 / imgScale);

																				stage.addChild(robot);
																				robotHash[player.name] = robot;
																				robotHash[player.name].bearing = player.bearing;
																				renderer.render(stage);
																				// movePlayer();
																}
												});
												console.log('robohash', robotHash);
								}

								function cardMove(playerObjs) {
												playerObjs.forEach(function (player, idx) {
																var robot = robotHash[player.name];
																var turn = false;
																// setTimeout(turnAndMove.bind(null, player), idx*.5 + 6000)

																turnAndMove();

																function turnAndMove() {
																				turnRobot();
																				moveRobot();
																}

																function turnRobot() {
																				var radians = Math.Pi / 180,
																				    angle;
																				// robot.position.x += imgSize/2;
																				// robot.position.y += imgSize/2;
																				if (player.bearing[0] + robot.bearing[0] === 0 || player.bearing[1] + robot.bearing[1]) {
																								var container = new PIXI.Container();
																								// console.log('container', container)
																								container.pivot.set(robot.position.x + imgSize / 2, robot.position.y + imgSize / 2);
																								// container.anchor.set(robot.position.x + imgSize/2, robot.position.y + imgSize/2)
																								container.addChild(robot);
																								console.log('here', player.name);
																								// robot.anchor.x = imgSize/2;
																								// robot.anchor.y = imgSize/2;
																								container.rotation = Math.PI / 2;

																								stage.addChild(container);
																				}
																				// robot.position.x -=imgSize/2
																				// robot.position.y -= imgSize/2;
																				renderer.render(stage);
																}

																function moveRobot() {
																				if (!turn && robot.position.x >= imgSize * player.location[0]) {
																								requestAnimationFrame(moveRobot);
																								robot.position.x -= 1;
																								renderer.render(stage);
																				}
																}
												});
								}

								buildTiles();
								drawDocks();
								drawDockLine();
								drawLasers();
								drawRobots(players);
								cardMove(playerCardMove);
								// newLocation(playerBoardMove);

								function buildMap() {
												renderer.render(stage);
												requestAnimationFrame(buildMap);
								}
								if ($scope.game) {

												buildMap();
								}
				}
});

function robotImage(robotName) {
				return robotName.toLowerCase().replace(/ /g, '') + '.png';
}

/* bearings

[-1,0] N
[0, 1] E
[0, -1] W
[1, 0] S

*/
app.config(function ($stateProvider) {

				$stateProvider.state('game', {
								url: '/game/:gameId/:playerId',
								templateUrl: '/js/game/game.html',
								controller: 'GameCtrl',
								resolve: {
												theGame: function theGame(GameFactory, $stateParams) {
																return GameFactory.getGame($stateParams.gameId);
												}
								}
				});
});

// window.start = function(){
//   document.getElementById("board").appendChild(renderer.view);
// }

// var stage = new PIXI.Stage(0x66ff99);
// var renderer = new PIXI.CanvasRenderer(450,450);

// //all image files are 150px. Do not change this number!
// var imgSizeActual = 150

// //factor to rescale images by. This number can be changed
// var imgScale = 4

// var imgSize = imgSizeActual/imgScale

// var tileImg = {
// "0": {"image":"/img/repair.jpg"},
// "1": {"image":"/img/option.jpg"},
// "2": {"image":"/img/empty.jpg"},
// "3": {"image":"/img/void.jpg"},
// "4": {"image":"/img/roller-express-wn.jpg"},
// "5": {"image":"/img/roller-express-south.jpg"},
// "6": {"image":"/img/roller-express-es.jpg"},
// "7": {"image":"/img/roller-express-sw.jpg"},
// "8": {"image":"/img/roller-express-se.jpg"},
// "9": {"image":"/img/roller-express-west.jpg"},
// "10": {"image":"/img/roller-express-north.jpg"},
// "11": {"image":"/img/roller-express-east.jpg"},
// "12": {"image":"/img/roller-east.png"},
// "13": {"image":"/img/roller-west.png"},
// "18": {"image":"/img/spinner-clockwise.jpg"},
// "19": {"image":"/img/spinner-counterclockwise.jpg"}
// };

// var walls = {
//   "noLaser": "/img/wall.png",

//   //images related to lasers that are on the north or east walls
//   "oneLaserNE": "/img/laser-single-NE.png",
//   "twoLasersNE": "/img/laser-double-NE.png",
//   "threeLasersNE": "/img/laser-triple-NE.png",

//   //images related to lasers that are on the south or west walls,
//   "oneLaserSW": "/img/laser-single-SW.png",
//   "twoLasersSW": "/img/laser-double-SW.png",
//   "threeLasersSW": "/img/laser-triple-SW.png",

//   map: [
//   //row, col, direction, number of lasers
//     [0,2,"north", 0], [0,4,"north", 0], [0,7,"north", 0], [0,9,"north", 0],
//     [2,0,"west", 0], [2,3,"south", 0], [2,11,"east", 0],
//     [3,5,"west", 0], [3,6,"east", 1],
//     [4,0,"west", 0], [4,11,"east", 0],
//     [5,8,"north", 1],
//     [6,3,"south", 1],
//     [7,0,"west", 0], [7,11,"east", 0],
//     [8,5,"west", 1], [8,6,"east", 0],
//     [9,0,"west", 0], [9,8,"north", 0], [9,11,"east", 0],
//     [11,2,"south", 0], [11,4,"south", 0], [11,7,"south", 0], [11,9,"south", 0]
//   ],
//   getWallImg: function(coordinate) {
//     var direction = coordinate[2];
//     var numLasers = coordinate[3];
//     var laserImgFile;
//     var wallSrc;

//     if(direction === "north" || direction === "east") laserImgFile = "NE";
//     else laserImgFile = "SW"

//     if (numLasers === 1) wallSrc = walls["oneLaser" + laserImgFile];
//     else if (numLasers === 2) wallSrc = walls["twoLasers" + laserImgFile];
//     else if (numLasers === 3) wallSrc = walls["threeLasers" + laserImgFile];
//     else wallSrc = walls.noLaser
//     return wallSrc;
//   }
// }

// var lasers = {
//   map: [
//   //start, end, vertical or horizontal
//   [[6,3], [5,3], "h"],
//   [[8,5], [8,8], "v"],
//   [[3,6], [3,2], "v"],
//   [[5,8], [6,8], "h"]
//   ]
// }

// var tiles = {
//   cols: 12,
//   rows: 12,
//   map: [
//     2,2,2,2,2,2,2,2,2,2,2,2,
//     2,8,11,11,6,2,2,8,11,11,6,2,
//     2,10,18,2,5,19,2,10,18,2,5,2,
//     2,10,0,18,5,2,2,10,1,18,5,2,
//     2,4,9,9,7,2,19,4,9,9,7,2,
//     2,2,2,2,19,2,2,2,2,19,2,2,
//     2,2,19,2,2,2,2,19,2,2,2,2,
//     2,8,11,11,6,19,2,8,11,11,6,2,
//     2,10,18,1,5,2,2,10,18,0,5,2,
//     2,10,2,18,5,2,19,10,2,18,5,2,
//     2,4,9,9,7,2,2,4,9,9,7,2,
//     2,2,2,2,2,2,2,2,2,2,2,2
//   ],
//   getTileImg: function(col, row){
//     var tileId = this.map[row * this.rows + col].toString();
//     var tileSrc = tileImg[tileId].image;
//     return tileSrc;
//   }
// };

// function buildMap(){
//   buildTiles();
//   buildWalls();
//   drawLasers();
//   drawPlayers(players, players1stMove);
// }

// function buildTiles() {
//   for (var col = 0; col < tiles.cols; col ++){
//     for (var row = 0; row < tiles.rows; row ++){
//       var tileSrc = tiles.getTileImg(col, row);
//                                                           //150x150 is the actual image size
//       var tile = new PIXI.extras.TilingSprite.fromImage(tileSrc, imgSizeActual, imgSizeActual)

//       tile.position.x = imgSize*col
//       tile.position.y = imgSize*row;
//       //rescales the 150px tile image to be 4 times smaller
//       tile.scale.set(1/imgScale, 1/imgScale);

//       stage.addChild(tile)
//     }
//   }
// }

// function buildWalls() {
//   for(var i = 0; i < walls.map.length; i++) {
//     var wallSrc = walls.getWallImg(walls.map[i])
//     var wall = new PIXI.Sprite(PIXI.Texture.fromImage(wallSrc))

//     wall.position.x = imgSize*walls.map[i][1];
//     wall.position.y = imgSize*walls.map[i][0];
//     wall.scale.set(1/imgScale, 1/imgScale);

//     if(walls.map[i][2] === "west") {
//       wall.rotation = Math.PI/2
//       if(walls.map[i][3] > 0) wall.position.x = wall.position.x + 37.5
//       else wall.position.x = wall.position.x + 5
//     }
//     else if (walls.map[i][2] === "south") {
//       if(walls.map[i][3] === 0) wall.position.y = wall.position.y + imgSize - 5     
//     }
//     else if (walls.map[i][2] === "east") {
//       wall.rotation = Math.PI/2
//       wall.position.x = wall.position.x + 37.5     
//     }

//     stage.addChild(wall);
//   }
// }

// function drawLasers() {
//   if(lasers) {
//     for(var i = 0; i < lasers.map.length; i++) {
//       var line = new PIXI.Graphics;
//       var xFrom, yFrom, xTo, yTo;
//       if(lasers.map[i][2] === "h" && lasers.map[i][0][0] > lasers.map[i][1][0]) {
//         xFrom = lasers.map[i][0][0] + 0.7
//         yFrom = lasers.map[i][0][1] + 0.5
//         xTo = lasers.map[i][1][0] + 0.1
//         yTo = lasers.map[i][1][1] + 0.5
//       }
//       else if(lasers.map[i][2] === "h") {
//         xFrom = lasers.map[i][0][0] + 0.3
//         yFrom = lasers.map[i][0][1] + 0.5
//         xTo = lasers.map[i][1][0] + 0.9
//         yTo = lasers.map[i][1][1] + 0.5
//       }
//       else if(lasers.map[i][2] === "v" && lasers.map[i][0][1] > lasers.map[i][1][1]) {
//         xFrom = lasers.map[i][0][0] + 0.5
//         yFrom = lasers.map[i][0][1] + 0.7
//         xTo = lasers.map[i][1][0] + 0.5
//         yTo = lasers.map[i][1][1] + 1
//       }
//       else {
//         xFrom = lasers.map[i][0][0] + 0.5
//         yFrom = lasers.map[i][0][1] + 0.1
//         xTo = lasers.map[i][1][0] + 0.5
//         yTo = lasers.map[i][1][1] + 1
//       }

//       line.lineStyle(1, 0xff0000)
//       line.moveTo(xFrom*37.5, yFrom*37.5)
//       line.lineTo(xTo*37.5, yTo*37.5)

//       stage.addChild(line)
//     }
//   }
// }

// function init(){
//   renderer.render(stage);
// }

// // var gameState = play;

// var robotImgs = {
//   //robot name: robot image path
//   "green": "/img/robots/robot_0.png",
//   "blue": "/img/robots/robot_1.png",
//   "yellow": "/img/robots/robot_2.png",
//   getRobotImg: function(robotName) {
//     return robotImgs[robotName]
//   }
// }

// var player1, player2, player3;
// //seed for original location
// var players = [
//   { player: "player1", location: [0,11], bearing: [-1, 0], robot: "green", priorityVal: null },
//   { player: "player2", location: [2,11], bearing: [-1, 0], robot: "blue", priorityVal: null },
//   { player: "player3", location: [4,11], bearing: [-1, 0], robot: "yellow", priorityVal: null },
// ]

// //seed for second location
// var players1stMove = [
//   { player: "player1", location: [0,9], bearing: [-1, 0], robot: "green", priorityVal: 500 },
//   { player: "player2", location: [2,7], bearing: [1, 0], robot: "blue", priorityVal: 200 },
//   { player: "player3", location: [4,8], bearing: [0, 1], robot: "yellow", priorityVal: 800 },
// ]

// function sortIntialDestination(initial, sortedDestination) {
//   var sortedInitial = [];

//   for(var i = 0; i < sortedDestination.length; i++) {
//     for(var j = 0; j < initial.length; j++) {
//       if(initial[j].robot === sortedDestination[i].robot) {
//         sortedInitial.push(initial[j])
//       }
//     }
//   }
//   return sortedInitial;
// }

// function drawPlayers(initial, destination) {
//   var sortedDestination = sortPlayersByPriority(destination);
//   console.log(sortedDestination)

//   var sortedInitial = sortIntialDestination(initial, sortedDestination);
//   console.log('sorted initial in the drawplayers fnc', sortedInitial)
//   sortedInitial.forEach(function(player, idx){

//     setTimeout(doSomething.bind(null, player), idx*2000);

//       function doSomething() {

//         var robotImg = robotImgs.getRobotImg(player.robot);
//         var robot = new PIXI.Sprite(PIXI.Texture.fromImage(robotImg));
//         robot.position.x = imgSize*player.location[0];
//         robot.position.y = imgSize*player.location[1];
//         robot.scale.set(1/imgScale, 1/imgScale);

//         stage.addChild(robot);

//         movePlayer()

//         function movePlayer() {
//           if(robot.position.y >= imgSize*sortedDestination[idx].location[1]) {
//             requestAnimationFrame(movePlayer);
//             robot.position.y -= 1;
//             renderer.render(stage);
//           }
//         }
//       }

//   })
//     // movePlayer();
// }
// // function drawPlayers(intial, destination) {
// //   players.forEach(function(player){

// //   })
// // }

// function sortPlayersByPriority (arrOfPlayerObjects) {
//   return arrOfPlayerObjects.sort(function(a,b) {
//     return b.priorityVal - a.priorityVal
//   })
// }

// buildMap();

// // function drawPlayers(initial, destination) {
// //   initial.forEach(function(player, idx){
// //     var robotImg = robotImgs.getRobotImg(player.robot);
// //     var robot = new PIXI.Sprite(PIXI.Texture.fromImage(robotImg));
// //     robot.position.x = imgSize*player.location[0];
// //     robot.position.y = imgSize*player.location[1];
// //     robot.scale.set(1/imgScale, 1/imgScale);

// //     stage.addChild(robot);

// //     movePlayer()

// //     function movePlayer() {
// //       if(robot.position.y >= imgSize*destination[idx].location[1]) {
// //         requestAnimationFrame(movePlayer);
// //         robot.position.y -= 1;
// //         renderer.render(stage);
// //       }
// //     }
// //   })

// //     // movePlayer();
// // }

app.config(function ($stateProvider) {
				$stateProvider.state('home', {
								url: '/',
								templateUrl: 'js/home/home.html'
				});
});
// var stage = new PIXI.Stage(0x66ff99);
// var renderer = new PIXI.CanvasRenderer(1800,1800);
//hi
// console.log(document);

// // document.body.appendChild(renderer.view);

// //all image files are 150px. Do not change this number!
// var imgSizeActual = 150

// //factor to rescale images by. This number can be changed
// var imgScale = 4

// var imgSize = imgSizeActual/imgScale

// var tileImg = {
// "0": {"image":"repair.jpg"},
// "1": {"image":"option.jpg"},
// "2": {"image":"empty.jpg"},
// "3": {"image":"void.jpg"},
// "4": {"image":"roller-express-wn.jpg"},
// "5": {"image":"roller-express-south.jpg"},
// "6": {"image":"roller-express-es.jpg"},
// "7": {"image":"roller-express-sw.jpg"},
// "8": {"image":"roller-express-se.jpg"},
// "9": {"image":"roller-express-west.jpg"},
// "10": {"image":"roller-express-north.jpg"},
// "11": {"image":"roller-express-east.jpg"},
// "12": {"image":"roller-east.png"},
// "13": {"image":"roller-west.png"},
// "18": {"image":"spinner-clockwise.jpg"},
// "19": {"image":"spinner-counterclockwise.jpg"}
// };

// var walls = {
//   "noLaser": "wall.png",

//   //images related to lasers that are on the north or east walls
//   "oneLaserNE": "laser-single-NE.png",
//   "twoLasersNE": "laser-double-NE.png",
//   "threeLasersNE": "laser-triple-NE.png",

//   //images related to lasers that are on the south or west walls,
//   "oneLaserSW": "laser-single-SW.png",
//   "twoLasersSW": "laser-double-SW.png",
//   "threeLasersSW": "laser-triple-SW.png",

//   map: [
//   //row, col, direction, number of lasers
//     [0,2,"north", 0], [0,4,"north", 0], [0,7,"north", 0], [0,9,"north", 0],
//     [2,0,"west", 0], [2,3,"south", 0], [2,11,"east", 0],
//     [3,5,"west", 0], [3,6,"east", 1],
//     [4,0,"west", 0], [4,11,"east", 0],
//     [5,8,"north", 1],
//     [6,3,"south", 1],
//     [7,0,"west", 0], [7,11,"east", 0],
//     [8,5,"west", 1], [8,6,"east", 0],
//     [9,0,"west", 0], [9,8,"north", 0], [9,11,"east", 0],
//     [11,2,"south", 0], [11,4,"south", 0], [11,7,"south", 0], [11,9,"south", 0]
//   ],
//   getWallImg: function(coordinate) {
//     var direction = coordinate[2];
//     var numLasers = coordinate[3];
//     var laserImgFile;
//     var wallSrc;

//     if(direction === "north" || direction === "east") laserImgFile = "NE";
//     else laserImgFile = "SW"

//     if (numLasers === 1) wallSrc = walls["oneLaser" + laserImgFile];
//     else if (numLasers === 2) wallSrc = walls["twoLasers" + laserImgFile];
//     else if (numLasers === 3) wallSrc = walls["threeLasers" + laserImgFile];
//     else wallSrc = walls.noLaser
//     return wallSrc;
//   }
// }

// var lasers = {
//   map: [
//   //start, end, vertical or horizontal
//   [[6,3], [5,3], "h"],
//   [[8,5], [8,8], "v"],
//   [[3,6], [3,2], "v"],
//   [[5,8], [6,8], "h"]
//   ]
// }

// var tiles = {
//   cols: 12,
//   rows: 12,
//   map: [
//     2,2,2,2,2,2,2,2,2,2,2,2,
//     2,8,11,11,6,2,2,8,11,11,6,2,
//     2,10,18,2,5,19,2,10,18,2,5,2,
//     2,10,0,18,5,2,2,10,1,18,5,2,
//     2,4,9,9,7,2,19,4,9,9,7,2,
//     2,2,2,2,19,2,2,2,2,19,2,2,
//     2,2,19,2,2,2,2,19,2,2,2,2,
//     2,8,11,11,6,19,2,8,11,11,6,2,
//     2,10,18,1,5,2,2,10,18,0,5,2,
//     2,10,2,18,5,2,19,10,2,18,5,2,
//     2,4,9,9,7,2,2,4,9,9,7,2,
//     2,2,2,2,2,2,2,2,2,2,2,2
//   ],
//   getTileImg: function(col, row){
//     var tileId = this.map[row * this.rows + col].toString();
//     var tileSrc = tileImg[tileId].image;
//     return tileSrc;
//   }
// };

// function buildMap(){
//   buildTiles();
//   buildWalls();
//   drawLasers();
// }

// function buildTiles() {
//   for (var col = 0; col < tiles.cols; col ++){
//     for (var row = 0; row < tiles.rows; row ++){
//       var tileSrc = tiles.getTileImg(col, row);
//                                                           //150x150 is the actual image size
//       var tile = new PIXI.extras.TilingSprite.fromImage(tileSrc, imgSizeActual, imgSizeActual)

//       tile.position.x = imgSize*col
//       tile.position.y = imgSize*row;
//       //rescales the 150px tile image to be 4 times smaller
//       tile.scale.set(1/imgScale, 1/imgScale);

//       stage.addChild(tile)
//     }
//   }
// }

// function buildWalls() {
//   for(var i = 0; i < walls.map.length; i++) {
//     var wallSrc = walls.getWallImg(walls.map[i])
//     var wall = new PIXI.Sprite(PIXI.Texture.fromImage(wallSrc))

//     wall.position.x = imgSize*walls.map[i][1];
//     wall.position.y = imgSize*walls.map[i][0];
//     wall.scale.set(1/imgScale, 1/imgScale);

//     if(walls.map[i][2] === "west") {
//       wall.rotation = Math.PI/2
//       if(walls.map[i][3] > 0) wall.position.x = wall.position.x + 37.5
//       else wall.position.x = wall.position.x + 5
//     }
//     else if (walls.map[i][2] === "south") {
//       if(walls.map[i][3] === 0) wall.position.y = wall.position.y + imgSize - 5     
//     }
//     else if (walls.map[i][2] === "east") {
//       wall.rotation = Math.PI/2
//       wall.position.x = wall.position.x + 37.5     
//     }

//     stage.addChild(wall);
//   }
// }

// function drawLasers() {
//   if(lasers) {
//     for(var i = 0; i < lasers.map.length; i++) {
//       var line = new PIXI.Graphics;
//       var xFrom, yFrom, xTo, yTo;
//       if(lasers.map[i][2] === "h" && lasers.map[i][0][0] > lasers.map[i][1][0]) {
//         xFrom = lasers.map[i][0][0] + 0.7
//         yFrom = lasers.map[i][0][1] + 0.5
//         xTo = lasers.map[i][1][0] + 0.1
//         yTo = lasers.map[i][1][1] + 0.5
//       }
//       else if(lasers.map[i][2] === "h") {
//         xFrom = lasers.map[i][0][0] + 0.3
//         yFrom = lasers.map[i][0][1] + 0.5
//         xTo = lasers.map[i][1][0] + 0.9
//         yTo = lasers.map[i][1][1] + 0.5
//       }
//       else if(lasers.map[i][2] === "v" && lasers.map[i][0][1] > lasers.map[i][1][1]) {
//         xFrom = lasers.map[i][0][0] + 0.5
//         yFrom = lasers.map[i][0][1] + 0.7
//         xTo = lasers.map[i][1][0] + 0.5
//         yTo = lasers.map[i][1][1] + 1
//       }
//       else {
//         xFrom = lasers.map[i][0][0] + 0.5
//         yFrom = lasers.map[i][0][1] + 0.1
//         xTo = lasers.map[i][1][0] + 0.5
//         yTo = lasers.map[i][1][1] + 1
//       }

//       line.lineStyle(1, 0xff0000)
//       line.moveTo(xFrom*37.5, yFrom*37.5)
//       line.lineTo(xTo*37.5, yTo*37.5)

//       stage.addChild(line)
//     }
//   }
// }

// function init(){
//   renderer.render(stage);
// }

// buildMap();

app.controller("LobbyController", function ($scope, FirebaseFactory) {

				var testkey = '56f88fcc06f200af25a0a5f9';

				var allGames = FirebaseFactory.getBase();
				$scope.games = allGames;
				// console.log(allGames)
});
app.config(function ($stateProvider) {
				$stateProvider.state('lobby', {
								url: '/lobby',
								controller: 'LobbyController',
								templateUrl: 'js/lobby/lobby.html',
								resolve: {
												boards: function boards(BoardFactory) {
																return BoardFactory.getAllBoards();
												}
								}
				});
});
app.controller("HostController", function ($scope, game, $stateParams, FirebaseFactory, GameFactory, $state) {

				var gameID = $stateParams.id;
				var hostID = $stateParams.hostId;

				var localGamePlayers = FirebaseFactory.getConnection(gameID + '/game' + '/players');
				$scope.players = localGamePlayers;

				$scope.game = game;

				$scope.startGame = function () {
								return GameFactory.startGame(gameID).then(function (response) {
												console.log('this is the response', response);
												$state.go('game', { gameId: response, playerId: hostID });
								});
				};
});
app.config(function ($stateProvider) {
				$stateProvider.state('host', {
								url: '/host/:id/:hostId',
								templateUrl: 'js/host/host.html',
								controller: 'HostController',
								resolve: {
												game: function game(GameFactory, $stateParams) {
																return GameFactory.getGame($stateParams.id);
												}
								}
				});
});
app.config(function ($stateProvider) {

				$stateProvider.state('login', {
								url: '/login',
								templateUrl: 'js/login/login.html',
								controller: 'LoginCtrl'
				});
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

				$scope.login = {};
				$scope.error = null;

				$scope.sendLogin = function (loginInfo) {

								$scope.error = null;

								AuthService.login(loginInfo).then(function () {
												$state.go('home');
								})['catch'](function () {
												$scope.error = 'Invalid login credentials.';
								});
				};
});
app.config(function ($stateProvider) {

				$stateProvider.state('membersOnly', {
								url: '/members-area',
								template: '<img ng-repeat="item in stash" width="300" ng-src="{{ item }}" />',
								controller: function controller($scope, SecretStash) {
												SecretStash.getStash().then(function (stash) {
																$scope.stash = stash;
												});
								},
								// The following data.authenticate is read by an event listener
								// that controls access to this state. Refer to app.js.
								data: {
												authenticate: true
								}
				});
});

app.factory('SecretStash', function ($http) {

				var getStash = function getStash() {
								return $http.get('/api/members/secret-stash').then(function (response) {
												return response.data;
								});
				};

				return {
								getStash: getStash
				};
});
app.controller("WaitingRoomController", function ($scope, game, $stateParams, PlayerFactory, FirebaseFactory, $state) {

				$scope.gameID = $stateParams.id;

				console.log($scope.gameID);

				$scope.players = FirebaseFactory.getConnection($scope.gameID + '/game' + '/players');

				$scope.localGame = FirebaseFactory.getConnection($scope.gameID + '/game' + '/state');
				console.log('this is the state', $scope.localGame);

				$scope.game = game;
				$scope.robots = [{ name: "Spin Bot", imgUrl: "/img/robots/spinbot.jpg" }, { name: "Twonky", imgUrl: "/img/robots/twonky.jpg" }, { name: "Zoom Bot", imgUrl: "/img/robots/zoombot.jpg" }];

				$scope.CreatePlayer = function (player, gameID) {
								return PlayerFactory.createPlayer(player, $scope.gameID).then(function (playerInfo) {
												var id = playerInfo.playerId;
												$scope.$watch('localGame.$value', function (state) {
																console.log('this is the local game', $scope.localGame.$value);
																console.log('this is state', state);
																if (state === 'decision') {
																				$state.go('game', { gameId: $scope.gameID, playerId: id });
																}
												});
								});
				};
});
app.config(function ($stateProvider) {
				$stateProvider.state('waitingroom', {
								url: '/waitingroom/:id',
								templateUrl: 'js/waitingroom/waitingroom.html',
								controller: 'WaitingRoomController',
								resolve: {
												game: function game(GameFactory, $stateParams) {
																console.log('this is the stateParams:', $stateParams);
																return GameFactory.getGame($stateParams.id);
												}
								}
				});
});
app.factory('BoardFactory', function ($http) {
				return {
								getAllBoards: function getAllBoards() {
												return $http.get('/api/board/').then(function (response) {
																return response.data;
												});
								},
								getOneBoard: function getOneBoard(boardId) {
												return $http.get('/api/board/' + boardId).then(function (response) {
																return response.data;
												});
								}
				};
});
app.factory('FirebaseFactory', function ($firebaseObject) {

				var FirebaseFactory = {};

				var baseUrl = "https://resplendent-torch-4322.firebaseio.com/";
				var baseConnection = $firebaseObject(new Firebase(baseUrl));

				FirebaseFactory.getConnection = function (key) {
								var localConnection = $firebaseObject(new Firebase(baseUrl + key));
								return localConnection;
				};

				FirebaseFactory.getBase = function () {
								return baseConnection;
				};

				return FirebaseFactory;
});
app.factory('FullstackPics', function () {
				return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large', 'https://pbs.twimg.com/media/CJ4vLfuUwAAda4L.jpg:large', 'https://pbs.twimg.com/media/CI7wzjEVEAAOPpS.jpg:large', 'https://pbs.twimg.com/media/CIdHvT2UsAAnnHV.jpg:large', 'https://pbs.twimg.com/media/CGCiP_YWYAAo75V.jpg:large', 'https://pbs.twimg.com/media/CIS4JPIWIAI37qu.jpg:large'];
});

app.factory('GameFactory', function ($http) {

				var GameFactory = {};

				GameFactory.createPlayerAndGame = function (data) {
								return $http.post('/api/game/', data).then(function (res) {
												return res.data;
								});
				};

				GameFactory.getGame = function (gameId) {
								return $http.get('/api/game/' + gameId).then(function (res) {
												return res.data;
								});
				};

				GameFactory.startGame = function (gameId) {
								return $http.get('/api/game/' + gameId + '/start').then(function (res) {
												return res.data;
								});
				};

				return GameFactory;
});
app.factory('PlayerFactory', function ($http) {

				var PlayerFactory = {};

				PlayerFactory.createPlayer = function (data, id) {
								return $http.post('/api/player/', { params: { "data": data, "id": id } }).then(function (res) {
												return res.data;
								});
				};

				return PlayerFactory;
});
app.factory('RandomGreetings', function () {

				var getRandomFromArray = function getRandomFromArray(arr) {
								return arr[Math.floor(Math.random() * arr.length)];
				};

				var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.', 'こんにちは、ユーザー様。', 'Welcome. To. WEBSITE.', ':D', 'Yes, I think we\'ve met before.', 'Gimme 3 mins... I just grabbed this really dope frittata', 'If Cooper could offer only one piece of advice, it would be to nevSQUIRREL!'];

				return {
								greetings: greetings,
								getRandomGreeting: function getRandomGreeting() {
												return getRandomFromArray(greetings);
								}
				};
});

// app.directive('board', function () {

//     return {
//         restrict: 'E',
//         templateUrl: '/js/game/board/board.html',
//         scope: {
//         	game: '='
//         },
//         link: function(scope, element) {
//         	window.start()
//         // 	var board = {
// 	       //    col0: [1, 13, 5, 11, 5, 1, 1, 5, 13, 5, 1, 30, 1, 1, 1, 1],
// 	       //    col1: [4, 100, 1, 11, 1, 1, 1, 90, 13, 1, 52, 2, 1, 1, 5, 1],
// 	       //    col2: [2, 13, 36, 11, 1, 60, 1, 1, 13, 60, 1, 1, 2, 1, 1, 4],
// 	       //    col3: [1, 13, 4, 1, 40, 41, 96, 1, 41, 10, 10, 10, 1, 1, 5, 1],
// 	       //    col4: [2, 13, 93, 71, 1, 1, 13, 1, 1, 50, 1, 4, 2, 1, 1, 4],
// 	       //    col5: [12, 15, 41, 71, 1, 1, 13, 60, 93, 1, 5, 1, 1, 1, 5, 1],
// 	       //    col6: [10, 10, 40, 71, 1, 36, 22, 10, 40, 10, 10, 10, 1, 1, 5, 1],
// 	       //    col7: [2, 1, 1, 71, 1, 12, 41, 1, 3, 36, 1, 4, 2, 1, 5, 4],
// 	       //    col8: [1, 1, 1, 71, 1, 8, 11, 1, 1, 60, 1, 1, 1, 1, 1, 1],
// 	       //    col9: [2, 1, 3, 87, 70, 74, 11, 1, 13, 13, 1, 51, 2, 1, 5, 4],
// 	       //    col10: [1, 60, 4, 71, 1, 88, 11, 1, 13, 19, 10, 10, 1, 1, 1, 1],
// 	       //    col11: [30, 1, 3, 71, 3, 73, 11, 53, 73, 3, 1, 1, 1, 1, 5, 1]
//       		// }
//         	init()
//         }
//     }

// });
// app.directive('pixi', function($parse, $state) {
//     return {
//         restrict: 'A',
//         scope: true,
//         controller: function($scope, $element, $attrs, $document, $window) {
//             var stage = new PIXI.Container();
//             var graphics = new PIXI.Graphics();

//             //all image files are 150px. Do not change this number!
//             var imgSizeActual = 150

//             //factor to rescale images by. This number can be changed
//             var imgScale = 3.75

//             var imgSize = imgSizeActual/imgScale
//             var cols = 12;
//             var rows = 16;
//             var board = {
//                       col0: [1, 13, 5, 11, 5, 1, 1, 5, 13, 5, 1, 30, 1, 1, 1, 1],
//                       col1: [4, 100, 1, 11, 1, 1, 1, 90, 13, 1, 52, 2, 1, 1, 5, 1],
//                       col2: [2, 13, 36, 11, 1, 60, 1, 1, 13, 60, 1, 1, 2, 1, 1, 4],
//                       col3: [1, 13, 4, 1, 40, 41, 96, 1, 41, 10, 10, 10, 1, 1, 5, 1],
//                       col4: [2, 13, 93, 71, 1, 1, 13, 1, 1, 50, 1, 4, 2, 1, 1, 4],
//                       col5: [12, 15, 41, 71, 1, 1, 13, 60, 93, 1, 5, 1, 1, 1, 5, 1],
//                       col6: [10, 10, 40, 71, 1, 36, 22, 10, 40, 10, 10, 10, 1, 1, 5, 1],
//                       col7: [2, 1, 1, 71, 1, 12, 41, 1, 3, 36, 1, 4, 2, 1, 5, 4],
//                       col8: [1, 1, 1, 71, 1, 8, 11, 1, 1, 60, 1, 1, 1, 1, 1, 1],
//                       col9: [2, 1, 3, 87, 70, 74, 11, 1, 13, 13, 1, 51, 2, 1, 5, 4],
//                       col10: [1, 60, 4, 71, 1, 88, 11, 1, 13, 19, 10, 10, 1, 1, 1, 1],
//                       col11: [30, 1, 3, 71, 3, 73, 11, 53, 73, 3, 1, 1, 1, 1, 5, 1]
//                     }

//             function createBoardArr (boardObj) {
//               for(var key in board) {
//                 if(key.slice(0,3) === 'col') boardArr.push(board[key])
//               }
//               return boardArr;
//             }

//             function drawDockLine() {
//               var line = new PIXI.Graphics;
//               line.lineStyle(4, 0x000000, 1);
//               line.moveTo(12*imgSizeActual/imgScale, 0)
//               line.lineTo(12*imgSizeActual/imgScale, 12*imgSizeActual/imgScale)

//               stage.addChild(line)
//             }

//             var init = function(stage, width, height) {
//                 // create the root of the scene graph
//                 var renderer = PIXI.autoDetectRenderer(640, 480, {view: $element, transparent: true})

//                 function buildTiles() {
//                   for (var col = 0; col < cols; col ++){
//                     for (var row = 0; row < rows; row ++){
//                       var tileSrc = '/img/tiles/' + boardArr[col][row] + '.jpg';
//                                                                           //150x150 is the actual image size
//                       var tile = new PIXI.extras.TilingSprite.fromImage(tileSrc, imgSizeActual, imgSizeActual)

//                       tile.position.x = imgSize*row
//                       tile.position.y = imgSize*cols - imgSize - imgSize * col;
//                       //rescales the 150px tile image to be 4 times smaller
//                       tile.scale.set(1/imgScale, 1/imgScale);

//                       stage.addChild(tile)
//                     }
//                   }
//                 }

//                 return renderer;
//             };

//             $element = $element[0];

//             init(stage, 640, 480);
//         }
//     };
// })
app.directive('ctrlpanel', function () {

				return {
								restrict: 'E',
								templateUrl: '/js/game/ctrlPanel/ctrlpanel.html',
								scope: {
												game: '='
								}
				};
});
app.directive('fullstackLogo', function () {
				return {
								restrict: 'E',
								templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
				};
});
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

				return {
								restrict: 'E',
								scope: {},
								templateUrl: 'js/common/directives/navbar/navbar.html',
								link: function link(scope) {

												scope.items = [{ label: 'Home', state: 'home' }, { label: 'About', state: 'lobby' }, { label: 'Documentation', state: 'docs' }, { label: 'Members Only', state: 'membersOnly', auth: true }];

												scope.user = null;

												scope.isLoggedIn = function () {
																return AuthService.isAuthenticated();
												};

												scope.logout = function () {
																AuthService.logout().then(function () {
																				$state.go('home');
																});
												};

												var setUser = function setUser() {
																AuthService.getLoggedInUser().then(function (user) {
																				scope.user = user;
																});
												};

												var removeUser = function removeUser() {
																scope.user = null;
												};

												setUser();

												$rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
												$rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
												$rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
								}

				};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZG9jcy9kb2NzLmpzIiwiY3JlYXRlZ2FtZS9jcmVhdGVnYW1lLmNvbnRyb2xsZXIuanMiLCJjcmVhdGVnYW1lL2NyZWF0ZWdhbWUuc3RhdGUuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImdhbWUvZ2FtZS5jb250cm9sbGVyLmpzIiwiZ2FtZS9nYW1lLnN0YXRlLmpzIiwiaG9tZS9ob21lLmpzIiwibG9iYnkvbG9iYnkuY29udHJvbGxlci5qcyIsImxvYmJ5L2xvYmJ5LnN0YXRlLmpzIiwiaG9zdC9ob3N0LmNvbnRyb2xsZXIuanMiLCJob3N0L2hvc3Quc3RhdGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsIm1lbWJlcnMtb25seS9tZW1iZXJzLW9ubHkuanMiLCJ3YWl0aW5ncm9vbS93YWl0aW5ncm9vbS5jb250cm9sbGVyLmpzIiwid2FpdGluZ3Jvb20vd2FpdGluZ3Jvb20uc3RhdGUuanMiLCJjb21tb24vZmFjdG9yaWVzL0JvYXJkRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRmlyZWJhc2VGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GdWxsc3RhY2tQaWNzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9HYW1lRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUGxheWVyRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUmFuZG9tR3JlZXRpbmdzLmpzIiwiZ2FtZS9jdHJscGFuZWwvY3RybHBhbmVsLmRpcmVjdGl2ZS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUE7O0FBRUEscUJBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7OztBQUdBLEdBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7O0FBR0EsUUFBQSw0QkFBQSxHQUFBLFNBQUEsNEJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUE7S0FDQSxDQUFBOzs7O0FBSUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7O0FBRUEsWUFBQSxDQUFBLDRCQUFBLENBQUEsT0FBQSxDQUFBLEVBQUE7OztBQUdBLG1CQUFBO1NBQ0E7O0FBRUEsWUFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7OztBQUdBLG1CQUFBO1NBQ0E7OztBQUdBLGFBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7OztBQUlBLGdCQUFBLElBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7YUFDQSxNQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7YUFDQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUNsREEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7O0FBR0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLGlCQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBOzs7QUFHQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNoQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxPQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUNMQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLE1BQUEsR0FBQSxNQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEseUJBQUEsRUFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxNQUFBLEVBQUEsd0JBQUEsRUFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEseUJBQUEsRUFBQSxDQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsV0FBQSxDQUFBLG1CQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsc0JBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxRQUFBLENBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDYkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxhQUFBO0FBQ0Esa0JBQUEsRUFBQSxzQkFBQTtBQUNBLG1CQUFBLEVBQUEsK0JBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxrQkFBQSxFQUFBLGdCQUFBLFlBQUEsRUFBQTtBQUNBLHVCQUFBLFlBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTthQUNBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENDWEEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBOzs7O0FBSUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsVUFBQSxLQUFBLElBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7Ozs7O0FBS0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7O0FDcElBLEdBQUEsQ0FBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLElBQUEsR0FBQSxPQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQTs7QUFFQSxhQUFBLGFBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxZQUFBLEdBQUEsR0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsVUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxNQUFBLENBQUE7S0FDQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBOzs7QUFHQSxRQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsU0FBQTtRQUNBLGtCQUFBLEdBQUEsSUFBQSxDQUFBLGtCQUFBO1FBQ0EsTUFBQSxHQUFBLElBQUEsQ0FBQSxNQUFBO1FBQ0EsU0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQTtRQUNBLE1BQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FDQSxHQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsUUFBQSxhQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsUUFBQSxRQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsYUFBQSxHQUFBLFFBQUEsQ0FBQTs7QUFFQSxhQUFBLEtBQUEsR0FBQTs7QUFFQSxZQUFBLEtBQUEsR0FBQSxJQUFBLFNBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxRQUFBLEdBQUEsa0JBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxFQUFBLE9BQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsY0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOzs7QUFJQSxZQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsaUJBQUEsWUFBQSxHQUFBO0FBQ0EsZ0JBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsR0FBQSxhQUFBLEdBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxHQUFBLGFBQUEsR0FBQSxRQUFBLEVBQUEsRUFBQSxHQUFBLGFBQUEsR0FBQSxRQUFBLENBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtTQUNBOztBQUVBLGlCQUFBLFVBQUEsR0FBQTtBQUNBLGlCQUFBLElBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBO0FBQ0EscUJBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEVBQUE7QUFDQSx3QkFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7O0FBRUEsd0JBQUEsSUFBQSxHQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsd0JBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxHQUFBLENBQUE7QUFDQSx3QkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLElBQUEsR0FBQSxPQUFBLEdBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQTs7QUFFQSx3QkFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsUUFBQSxDQUFBLENBQUE7O0FBRUEseUJBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7aUJBQ0E7YUFDQTtTQUNBO0FBQ0EsaUJBQUEsU0FBQSxHQUFBO0FBQ0EsaUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLG9CQUFBLE9BQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLEVBQUEsRUFBQSxJQUFBLEVBQUEsWUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQTs7QUFFQSxpQkFBQSxVQUFBLEdBQUE7QUFDQSxpQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0Esb0JBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0Esb0JBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0Esb0JBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7aUJBQ0EsTUFDQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7aUJBQ0EsTUFDQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLHlCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSx5QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsdUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2lCQUNBLE1BQ0E7QUFDQSx5QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtpQkFDQTs7QUFFQSxvQkFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsT0FBQSxFQUFBLEtBQUEsR0FBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLEVBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxDQUFBOztBQUVBLHFCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBRUE7U0FDQTs7QUFHQSxZQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxDQUFBOztBQUVBLFlBQUEsT0FBQSxHQUFBLENBQ0EsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLENBQ0EsQ0FBQTs7O0FBR0EsWUFBQSxjQUFBLEdBQUEsQ0FDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLENBQ0EsQ0FBQTs7Ozs7Ozs7QUFTQSxZQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsaUJBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLG9CQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsU0FBQSxFQUFBLFlBQUEsRUFBQSxDQUFBOztBQUVBLHlCQUFBLFlBQUEsR0FBQTtBQUNBLHdCQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0Esd0JBQUEsS0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx5QkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx5QkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx5QkFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsUUFBQSxDQUFBLENBQUE7O0FBRUEseUJBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSw2QkFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSw2QkFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLDRCQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBOztpQkFFQTthQUNBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtTQUNBOztBQUVBLGlCQUFBLFFBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLEdBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7OztBQUdBLDJCQUFBLEVBQUEsQ0FBQTs7QUFFQSx5QkFBQSxXQUFBLEdBQUE7QUFDQSw2QkFBQSxFQUFBLENBQUE7QUFDQSw2QkFBQSxFQUFBLENBQUE7aUJBQ0E7O0FBRUEseUJBQUEsU0FBQSxHQUFBO0FBQ0Esd0JBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQTt3QkFBQSxLQUFBLENBQUE7OztBQUdBLHdCQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsNEJBQUEsU0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFNBQUEsRUFBQSxDQUFBOztBQUVBLGlDQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxpQ0FBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLCtCQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7OztBQUdBLGlDQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBOztBQUVBLDZCQUFBLENBQUEsUUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO3FCQUVBOzs7QUFHQSw0QkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtpQkFDQTs7QUFFQSx5QkFBQSxTQUFBLEdBQUE7QUFDQSx3QkFBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsSUFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLDZDQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSw2QkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0NBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7cUJBQ0E7aUJBQ0E7YUFDQSxDQUFBLENBQUE7U0FDQTs7QUFHQSxrQkFBQSxFQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUE7QUFDQSxvQkFBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTs7O0FBR0EsaUJBQUEsUUFBQSxHQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxpQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxZQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUE7O0FBRUEsb0JBQUEsRUFBQSxDQUFBO1NBQ0E7S0FDQTtDQUdBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLFVBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxXQUFBLFNBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQTtDQUNBOzs7Ozs7Ozs7O0FDNU9BLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLHlCQUFBO0FBQ0EsbUJBQUEsRUFBQSxvQkFBQTtBQUNBLGtCQUFBLEVBQUEsVUFBQTtBQUNBLGVBQUEsRUFBQTtBQUNBLG1CQUFBLEVBQUEsaUJBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQTtBQUNBLHVCQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDWkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMQSxHQUFBLENBQUEsVUFBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsZUFBQSxFQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBLDBCQUFBLENBQUE7O0FBRUEsUUFBQSxRQUFBLEdBQUEsZUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxRQUFBLENBQUE7O0NBR0EsQ0FBQSxDQUFBO0FDUkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxpQkFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxrQkFBQSxFQUFBLGdCQUFBLFlBQUEsRUFBQTtBQUNBLHVCQUFBLFlBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTthQUNBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNYQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLFlBQUEsRUFBQSxlQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxRQUFBLE1BQUEsR0FBQSxZQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQTs7QUFFQSxRQUFBLGdCQUFBLEdBQUEsZUFBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLEdBQUEsT0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQSxnQkFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsV0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxzQkFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FJQSxDQUFBLENBQUE7QUNwQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxtQkFBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7QUFDQSxrQkFBQSxFQUFBLGdCQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxjQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNYQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxjQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDRCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0JBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGVBQUE7QUFDQSxnQkFBQSxFQUFBLG1FQUFBO0FBQ0Esa0JBQUEsRUFBQSxvQkFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsdUJBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7O0FBR0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLEdBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLFFBQUE7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDL0JBLEdBQUEsQ0FBQSxVQUFBLENBQUEsdUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxlQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLEVBQUEsQ0FBQTs7QUFFQSxXQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxHQUFBLGVBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsR0FBQSxPQUFBLEdBQUEsVUFBQSxDQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxlQUFBLENBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLHlCQUFBLEVBQUEsRUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLHdCQUFBLEVBQUEsRUFBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLHlCQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxhQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsRUFBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLE1BQUEsQ0FBQSxrQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsdUJBQUEsQ0FBQSxHQUFBLENBQUEsd0JBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsS0FBQSxLQUFBLFVBQUEsRUFBQTtBQUNBLDBCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsRUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLENBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO2lCQUNBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtDQUlBLENBQUEsQ0FBQTtBQzlCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGtCQUFBO0FBQ0EsbUJBQUEsRUFBQSxpQ0FBQTtBQUNBLGtCQUFBLEVBQUEsdUJBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLGNBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNaQSxHQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFdBQUE7QUFDQSxvQkFBQSxFQUFBLHdCQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBO3VCQUFBLFFBQUEsQ0FBQSxJQUFBO2FBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxtQkFBQSxFQUFBLHFCQUFBLE9BQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxHQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUE7dUJBQUEsUUFBQSxDQUFBLElBQUE7YUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNYQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxlQUFBLEVBQUE7O0FBRUEsUUFBQSxlQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBLGdEQUFBLENBQUE7QUFDQSxRQUFBLGNBQUEsR0FBQSxlQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLGFBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsZUFBQSxHQUFBLGVBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsZUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxjQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUEsZUFBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDbEJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLENBQ0EsdURBQUEsRUFDQSxxSEFBQSxFQUNBLGlEQUFBLEVBQ0EsaURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxDQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDN0JBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxlQUFBLENBQUEsbUJBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG1CQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUEsV0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDMUJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsYUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLElBQUEsRUFBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG1CQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUEsYUFBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDYkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxpQkFBQSxFQUFBLFlBQUE7O0FBRUEsUUFBQSxrQkFBQSxHQUFBLFNBQUEsa0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsUUFBQSxTQUFBLEdBQUEsQ0FDQSxlQUFBLEVBQ0EsdUJBQUEsRUFDQSxzQkFBQSxFQUNBLHVCQUFBLEVBQ0EseURBQUEsRUFDQSwwQ0FBQSxFQUNBLGNBQUEsRUFDQSx1QkFBQSxFQUNBLElBQUEsRUFDQSxpQ0FBQSxFQUNBLDBEQUFBLEVBQ0EsNkVBQUEsQ0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLFNBQUE7QUFDQSx5QkFBQSxFQUFBLDZCQUFBO0FBQ0EsbUJBQUEsa0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzVCQSxHQUFBLENBQUEsU0FBQSxDQUFBLFdBQUEsRUFBQSxZQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLG1DQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO1NBQ0E7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDVEEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLHlEQUFBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ0xBLEdBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsRUFBQTtBQUNBLG1CQUFBLEVBQUEseUNBQUE7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUE7O0FBRUEsaUJBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FDQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsZUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxjQUFBLEVBQUEsS0FBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQ0EsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLHVCQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLDJCQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSwwQkFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLE9BQUEsR0FBQSxTQUFBLE9BQUEsR0FBQTtBQUNBLDJCQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EseUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsZ0JBQUEsVUFBQSxHQUFBLFNBQUEsVUFBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxtQkFBQSxFQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1NBRUE7O0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdGdWxsc3RhY2tHZW5lcmF0ZWRBcHAnLCBbJ2ZzYVByZUJ1aWx0JywgJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdBbmltYXRlJywgJ2ZpcmViYXNlJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEZ1bGxzdGFja1BpY3MpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gXy5zaHVmZmxlKEZ1bGxzdGFja1BpY3MpO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb2NzJywge1xuICAgICAgICB1cmw6ICcvZG9jcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG9jcy9kb2NzLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsImFwcC5jb250cm9sbGVyKFwiQ3JlYXRlR2FtZUNvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHNjb3BlLCBib2FyZHMsIEdhbWVGYWN0b3J5LCAkc3RhdGUpIHtcblxuXHQkc2NvcGUuYm9hcmRzID0gYm9hcmRzXG5cblx0JHNjb3BlLnJvYm90cyA9IFt7bmFtZTogXCJTcGluIEJvdFwiLCBpbWdVcmw6IFwiL2ltZy9yb2JvdHMvc3BpbmJvdC5qcGdcIn0sIHtuYW1lOiBcIlR3b25reVwiLCBpbWdVcmw6IFwiL2ltZy9yb2JvdHMvdHdvbmt5LmpwZ1wifSwge25hbWU6IFwiWm9vbSBCb3RcIiwgaW1nVXJsOiBcIi9pbWcvcm9ib3RzL3pvb21ib3QuanBnXCJ9XVxuXG5cdCRzY29wZS5DcmVhdGVHYW1lID0gZnVuY3Rpb24oZ2FtZSkge1xuXHRcdHJldHVybiBHYW1lRmFjdG9yeS5jcmVhdGVQbGF5ZXJBbmRHYW1lKGdhbWUpXG5cdFx0LnRoZW4oZnVuY3Rpb24oZ2FtZUluZm8pIHtcblx0XHRcdGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByZXNwb25zZScsIGdhbWVJbmZvKVxuXHRcdFx0JHN0YXRlLmdvKCdob3N0Jywge2lkOiBnYW1lSW5mby5faWQsIGhvc3RJZDogZ2FtZUluZm8uaG9zdC5faWR9KVxuXHRcdH0pXG5cdH1cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjcmVhdGVnYW1lJywge1xuXHRcdHVybDogJy9jcmVhdGVnYW1lJyxcblx0XHRjb250cm9sbGVyOiAnQ3JlYXRlR2FtZUNvbnRyb2xsZXInLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvY3JlYXRlZ2FtZS9jcmVhdGVnYW1lLmh0bWwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGJvYXJkczogZnVuY3Rpb24oQm9hcmRGYWN0b3J5KSB7XG5cdFx0XHRcdHJldHVybiBCb2FyZEZhY3RvcnkuZ2V0QWxsQm9hcmRzKClcblx0XHRcdH1cblx0XHR9XG5cdH0pXG59KSIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ0dhbWVDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIHRoZUdhbWUpe1xuXG5cdCRzY29wZS5nYW1lID0gdGhlR2FtZTtcblx0JHNjb3BlLmJvYXJkT2JqID0gJHNjb3BlLmdhbWUuYm9hcmRcblx0JHNjb3BlLmRvY2tzID0gJHNjb3BlLmdhbWUuYm9hcmQuZG9ja0xvY2F0aW9uc1xuXHQkc2NvcGUubGFzZXJzID0gJHNjb3BlLmdhbWUuYm9hcmQubGFzZXJMb2NhdGlvbnNcblx0Ly8gY29uc29sZS5sb2coJHNjb3BlLmxhc2Vycylcblx0ZnVuY3Rpb24gY29sbGVjdE9uZUNvbChuKXtcblx0dmFyIGtleSA9ICdjb2wnICsgbi50b1N0cmluZygpO1xuXHR2YXIgaWRlbnRzID0gJHNjb3BlLmJvYXJkT2JqW2tleV0ubWFwKGZ1bmN0aW9uKHRpbGUpe1xuXHQgIHJldHVybiB0aWxlLmlkZW50aWZpZXI7XG5cdH0pO1xuXHRyZXR1cm4gaWRlbnRzO1xuXHR9XG5cblx0JHNjb3BlLmJvYXJkID0gW107XG5cdGZvcih2YXIgaSA9IDA7IGkgPD0gMTE7IGkgKyspe1xuXHRcdCRzY29wZS5ib2FyZC5wdXNoKGNvbGxlY3RPbmVDb2woaSkpO1xuXHR9XG5cdC8vIGNvbnNvbGUubG9nKCRzY29wZS5kb2NrcylcblxuXHR2YXIgQ29udGFpbmVyID0gUElYSS5Db250YWluZXIsXG4gICAgYXV0b0RldGVjdFJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIsXG4gICAgbG9hZGVyID0gUElYSS5sb2FkZXIsXG4gICAgcmVzb3VyY2VzID0gUElYSS5sb2FkZXIucmVzb3VyY2VzLFxuICAgIFNwcml0ZSA9IFBJWEkuU3ByaXRlO1xuXG5cdGxvYWRlclxuICBcdC5hZGQoXCJpbWcvc3ByaXRlc2hlZXQuanNvblwiKVxuICBcdC5sb2FkKHNldHVwKTtcblxuICBcdHZhciBpZCA9IFBJWEkubG9hZGVyLnJlc291cmNlc1tcImltZy9zcHJpdGVzaGVldC5qc29uXCJdLnRleHR1cmVzOyBcbiAgICB2YXIgaW1nU2l6ZUFjdHVhbCA9IDE1MCBcblx0dmFyIGltZ1NjYWxlID0gNFxuXHR2YXIgaW1nU2l6ZSA9IGltZ1NpemVBY3R1YWwvaW1nU2NhbGVcblxuXHRmdW5jdGlvbiBzZXR1cCgpIHtcblxuXHQgICAgdmFyIHN0YWdlID0gbmV3IENvbnRhaW5lcigpO1xuXHQgICAgdmFyIHJlbmRlcmVyID0gYXV0b0RldGVjdFJlbmRlcmVyKGltZ1NpemUqMTYsaW1nU2l6ZSoxMik7XG5cdCAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkQ29udGFpbmVyXCIpLmFwcGVuZENoaWxkKHJlbmRlcmVyLnZpZXcpXG5cblxuXHRcdC8vZmFjdG9yIHRvIHJlc2NhbGUgaW1hZ2VzIGJ5LiBUaGlzIG51bWJlciBjYW4gYmUgY2hhbmdlZFxuXHRcdHZhciBjb2xzID0gMTI7XG5cdFx0dmFyIHJvd3MgPSAxNjtcblxuXHRcdGZ1bmN0aW9uIGRyYXdEb2NrTGluZSgpIHtcblx0XHQgIHZhciBsaW5lID0gbmV3IFBJWEkuR3JhcGhpY3M7XG5cdFx0ICBsaW5lLmxpbmVTdHlsZSg0LCAweDAwMDAwMCwgMSk7XG5cdFx0ICBsaW5lLm1vdmVUbygxMippbWdTaXplQWN0dWFsL2ltZ1NjYWxlLCAwKVxuXHRcdCAgbGluZS5saW5lVG8oMTIqaW1nU2l6ZUFjdHVhbC9pbWdTY2FsZSwgMTIqaW1nU2l6ZUFjdHVhbC9pbWdTY2FsZSlcblxuXHRcdCAgc3RhZ2UuYWRkQ2hpbGQobGluZSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBidWlsZFRpbGVzKCkge1xuXHRcdCAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgY29sczsgY29sICsrKXtcblx0XHQgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgcm93czsgcm93ICsrKXtcblx0XHQgICAgICB2YXIgdGlsZVNyYyA9ICRzY29wZS5ib2FyZFtjb2xdW3Jvd10gKyAnLmpwZyc7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vMTUweDE1MCBpcyB0aGUgYWN0dWFsIGltYWdlIHNpemVcblx0XHQgICAgICB2YXIgdGlsZSA9IG5ldyBTcHJpdGUocmVzb3VyY2VzW1wiaW1nL3Nwcml0ZXNoZWV0Lmpzb25cIl0udGV4dHVyZXNbdGlsZVNyY10pO1xuXHRcdCAgICAgIFxuXHRcdCAgICAgIHRpbGUucG9zaXRpb24ueCA9IGltZ1NpemUqcm93XG5cdFx0ICAgICAgdGlsZS5wb3NpdGlvbi55ID0gaW1nU2l6ZSpjb2xzIC0gaW1nU2l6ZSAtIGltZ1NpemUgKiBjb2w7XG5cdFx0ICAgICAgLy9yZXNjYWxlcyB0aGUgMTUwcHggdGlsZSBpbWFnZSB0byBiZSA0IHRpbWVzIHNtYWxsZXIgXG5cdFx0ICAgICAgdGlsZS5zY2FsZS5zZXQoMS9pbWdTY2FsZSwgMS9pbWdTY2FsZSk7XG5cblx0XHQgICAgICBzdGFnZS5hZGRDaGlsZCh0aWxlKVxuXHRcdCAgICB9XG5cdFx0ICB9XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGRyYXdEb2NrcygpIHtcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCAkc2NvcGUuZG9ja3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGRvY2tOdW0gPSBpKzE7XG5cdFx0XHRcdHZhciBkb2NrID0gbmV3IFBJWEkuVGV4dChkb2NrTnVtLnRvU3RyaW5nKCksIHtmb250IDogJzI0cHggQXJpYWwnLCBmaWxsIDogMHgwMDAwMDAsIGFsaWduIDogJ2NlbnRlcid9KVxuXHRcdFx0XHRkb2NrLnBvc2l0aW9uLnggPSAkc2NvcGUuZG9ja3NbaV1bMF0qaW1nU2l6ZSArIDEzO1xuXHRcdFx0XHRkb2NrLnBvc2l0aW9uLnkgPSAkc2NvcGUuZG9ja3NbaV1bMV0qaW1nU2l6ZSArIDU7XG5cdFx0XHRcdHN0YWdlLmFkZENoaWxkKGRvY2spO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGRyYXdMYXNlcnMoKSB7XG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgJHNjb3BlLmxhc2Vycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbGluZSA9IG5ldyBQSVhJLkdyYXBoaWNzO1xuXHRcdFx0XHR2YXIgeEZyb20sIHlGcm9tLCB4VG8sIHlUbztcblx0XHRcdFx0aWYoJHNjb3BlLmxhc2Vyc1tpXVszXSA9PT0gXCJoXCIgJiYgJHNjb3BlLmxhc2Vyc1tpXVswXVswXSA+ICRzY29wZS5sYXNlcnNbaV1baV1bMV1bMF0pIHtcblx0XHRcdFx0XHR4RnJvbSA9ICRzY29wZS5sYXNlcnNbaV1bMF1bMF0gXG5cdFx0XHRcdFx0eUZyb20gPSAkc2NvcGUubGFzZXJzW2ldWzBdWzFdICsgMC41XG5cdFx0XHRcdFx0eFRvID0gJHNjb3BlLmxhc2Vyc1tpXVsxXVswXSBcblx0XHRcdFx0XHR5VG8gPSAkc2NvcGUubGFzZXJzW2ldWzFdWzFdICsgMC41XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZigkc2NvcGUubGFzZXJzW2ldWzNdID09PSBcImhcIikge1xuXHRcdFx0XHRcdHhGcm9tID0gJHNjb3BlLmxhc2Vyc1tpXVswXVswXSBcblx0XHRcdFx0XHR5RnJvbSA9ICRzY29wZS5sYXNlcnNbaV1bMF1bMV0gKyAwLjVcblx0XHRcdFx0XHR4VG8gPSAkc2NvcGUubGFzZXJzW2ldWzFdWzBdIFxuXHRcdFx0XHRcdHlUbyA9ICRzY29wZS5sYXNlcnNbaV1bMV1bMV0gKyAwLjVcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKCRzY29wZS5sYXNlcnNbaV1bM10gPT09IFwidlwiICYmICRzY29wZS5sYXNlcnNbaV1bMF1bMV0gPiAkc2NvcGUubGFzZXJzW2ldWzFdWzFdKSB7XG5cdFx0XHRcdFx0eEZyb20gPSAkc2NvcGUubGFzZXJzW2ldWzBdWzBdICsgMC41XG5cdFx0XHRcdFx0eUZyb20gPSAkc2NvcGUubGFzZXJzW2ldWzBdWzFdIFxuXHRcdFx0XHRcdHhUbyA9ICRzY29wZS5sYXNlcnNbaV1bMV1bMF0gKyAwLjVcblx0XHRcdFx0XHR5VG8gPSAkc2NvcGUubGFzZXJzW2ldWzFdWzFdIFxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHhGcm9tID0gJHNjb3BlLmxhc2Vyc1tpXVswXVswXSArIDAuNVxuXHRcdFx0XHRcdHlGcm9tID0gJHNjb3BlLmxhc2Vyc1tpXVswXVsxXSBcblx0XHRcdFx0XHR4VG8gPSAkc2NvcGUubGFzZXJzW2ldWzFdWzBdICsgMC41XG5cdFx0XHRcdFx0eVRvID0gJHNjb3BlLmxhc2Vyc1tpXVsxXVsxXSBcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxpbmUubGluZVN0eWxlKDEsIDB4ZmYwMDAwKVxuXHRcdFx0XHRsaW5lLm1vdmVUbyh4RnJvbSppbWdTaXplLCB5RnJvbSppbWdTaXplKVxuXHRcdFx0XHRsaW5lLmxpbmVUbyh4VG8qaW1nU2l6ZSwgeVRvKmltZ1NpemUpXG5cblx0XHRcdFx0c3RhZ2UuYWRkQ2hpbGQobGluZSlcblx0XHRcdCAgICBcblx0XHRcdH1cblx0XHR9XG5cblxuXHRcdHZhciBwbGF5ZXIxLCBwbGF5ZXIyLCBwbGF5ZXIzO1xuXHRcdC8vc2VlZCBmb3Igb3JpZ2luYWwgbG9jYXRpb25cblx0XHR2YXIgcGxheWVycyA9IFtcblx0XHQgIHsgbmFtZTogXCJwbGF5ZXIxXCIsIGxvY2F0aW9uOiBbMTUsNV0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcIkhhbW1lciBCb3RcIiwgcHJpb3JpdHlWYWw6IG51bGwgfSxcblx0XHQgIHsgbmFtZTogXCJwbGF5ZXIyXCIsIGxvY2F0aW9uOiBbMTUsNl0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcIlNwaW4gQm90XCIsIHByaW9yaXR5VmFsOiBudWxsIH0sXG5cdFx0ICB7IG5hbWU6IFwicGxheWVyM1wiLCBsb2NhdGlvbjogWzE0LDNdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJUd29ua3lcIiwgcHJpb3JpdHlWYWw6IG51bGwgfSxcblx0XHRdXG5cblx0XHQvL3NlZWQgZm9yIHNlY29uZCBsb2NhdGlvblxuXHRcdHZhciBwbGF5ZXJDYXJkTW92ZSA9IFtcblx0XHQgIHsgbmFtZTogXCJwbGF5ZXIxXCIsIGxvY2F0aW9uOiBbMTUsNV0sIGJlYXJpbmc6IFswLCAxXSwgcm9ib3Q6IFwiSGFtbWVyIEJvdFwiLCBwcmlvcml0eVZhbDogNTAwIH0sXG5cdFx0ICB7IG5hbWU6IFwicGxheWVyM1wiLCBsb2NhdGlvbjogWzEzLDNdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJUd29ua3lcIiwgcHJpb3JpdHlWYWw6IDgwMCB9LFxuXHRcdCAgeyBuYW1lOiBcInBsYXllcjJcIiwgbG9jYXRpb246IFsxMiw2XSwgYmVhcmluZzogWy0xLCAwXSwgcm9ib3Q6IFwiU3BpbiBCb3RcIiwgcHJpb3JpdHlWYWw6IDIwMCB9LFxuXHRcdF1cblxuXHRcdC8vIHZhciBwbGF5ZXJCb2FyZE1vdmUgPSBbXG5cdFx0Ly8gXHR7IG5hbWU6IFwicGxheWVyM1wiLCBsb2NhdGlvbjogWzEyLDNdLCBiZWFyaW5nOiBbMSwgMF0sIHJvYm90OiBcIlR3b25reVwiLCBwcmlvcml0eVZhbDogODAwIH0sXG5cdFx0Ly8gXHR7IG5hbWU6IFwicGxheWVyMVwiLCBsb2NhdGlvbjogWzE0LDVdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJIYW1tZXIgQm90XCIsIHByaW9yaXR5VmFsOiA1MDAgfSxcblx0XHQvLyBcdHsgbmFtZTogXCJwbGF5ZXIyXCIsIGxvY2F0aW9uOiBbMTIsIDZdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJTcGluIEJvdFwiLCBwcmlvcml0eVZhbDogMjAwIH0sXG5cdFx0Ly8gXVxuXG5cblx0XHR2YXIgcm9ib3RIYXNoID0ge307XG5cblx0XHRmdW5jdGlvbiBkcmF3Um9ib3RzKGluaXRpYWwpIHtcblx0XHRcdGluaXRpYWwuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIsIGlkeCl7XG5cdFx0XHRcdGlmKHJvYm90SGFzaFtwbGF5ZXIubmFtZV0gPT09IHVuZGVmaW5lZCkgY3JlYXRlU3ByaXRlKCk7XG5cblx0XHRcdFx0ZnVuY3Rpb24gY3JlYXRlU3ByaXRlKCkge1xuXHRcdFx0XHRcdHZhciByb2JvdEltZyA9IHJvYm90SW1hZ2UocGxheWVyLnJvYm90KTtcblx0XHRcdFx0XHR2YXIgcm9ib3QgPSBuZXcgU3ByaXRlKHJlc291cmNlc1tcImltZy9zcHJpdGVzaGVldC5qc29uXCJdLnRleHR1cmVzW3JvYm90SW1nXSlcblx0XHRcdFx0XHRyb2JvdC5wb3NpdGlvbi54ID0gaW1nU2l6ZSpwbGF5ZXIubG9jYXRpb25bMF07XG5cdFx0XHQgICAgICAgIHJvYm90LnBvc2l0aW9uLnkgPSBpbWdTaXplKnBsYXllci5sb2NhdGlvblsxXTtcblx0XHRcdCAgICAgICAgcm9ib3Quc2NhbGUuc2V0KDEvaW1nU2NhbGUsIDEvaW1nU2NhbGUpO1xuXG5cdFx0XHQgICAgICBcdHN0YWdlLmFkZENoaWxkKHJvYm90KTtcblx0XHRcdCAgICAgIFx0cm9ib3RIYXNoW3BsYXllci5uYW1lXSA9IHJvYm90O1xuXHRcdFx0ICAgICAgXHRyb2JvdEhhc2hbcGxheWVyLm5hbWVdLmJlYXJpbmcgPSBwbGF5ZXIuYmVhcmluZztcblx0XHRcdCAgICAgIFx0cmVuZGVyZXIucmVuZGVyKHN0YWdlKVxuXHRcdFx0ICAgICAgXHQvLyBtb3ZlUGxheWVyKCk7XG5cdFx0XHRcdH1cdFxuXHRcdFx0fSlcblx0XHRcdFx0Y29uc29sZS5sb2coJ3JvYm9oYXNoJywgcm9ib3RIYXNoKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGNhcmRNb3ZlKHBsYXllck9ianMpIHtcblx0XHRcdHBsYXllck9ianMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIsaWR4KXtcblx0XHRcdFx0dmFyIHJvYm90ID0gcm9ib3RIYXNoW3BsYXllci5uYW1lXTtcblx0XHRcdFx0dmFyIHR1cm4gPSBmYWxzZTtcblx0XHRcdFx0Ly8gc2V0VGltZW91dCh0dXJuQW5kTW92ZS5iaW5kKG51bGwsIHBsYXllciksIGlkeCouNSArIDYwMDApXG5cblx0XHRcdFx0dHVybkFuZE1vdmUoKVxuXG5cdFx0XHRcdGZ1bmN0aW9uIHR1cm5BbmRNb3ZlKCkge1xuXHRcdFx0XHRcdHR1cm5Sb2JvdCgpO1xuXHRcdFx0XHRcdG1vdmVSb2JvdCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnVuY3Rpb24gdHVyblJvYm90KCkge1xuXHRcdFx0XHRcdHZhciByYWRpYW5zID0gTWF0aC5QaS8xODAsIGFuZ2xlO1xuXHRcdFx0XHRcdC8vIHJvYm90LnBvc2l0aW9uLnggKz0gaW1nU2l6ZS8yO1xuXHRcdFx0XHRcdC8vIHJvYm90LnBvc2l0aW9uLnkgKz0gaW1nU2l6ZS8yO1xuXHRcdFx0XHRcdGlmKHBsYXllci5iZWFyaW5nWzBdICsgcm9ib3QuYmVhcmluZ1swXSA9PT0gMCB8fCBwbGF5ZXIuYmVhcmluZ1sxXSArIHJvYm90LmJlYXJpbmdbMV0pIHtcblx0XHRcdFx0XHRcdHZhciBjb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcblx0XHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKCdjb250YWluZXInLCBjb250YWluZXIpXG5cdFx0XHRcdFx0XHRjb250YWluZXIucGl2b3Quc2V0KHJvYm90LnBvc2l0aW9uLnggKyBpbWdTaXplLzIsIHJvYm90LnBvc2l0aW9uLnkgKyBpbWdTaXplLzIpXG5cdFx0XHRcdFx0XHQvLyBjb250YWluZXIuYW5jaG9yLnNldChyb2JvdC5wb3NpdGlvbi54ICsgaW1nU2l6ZS8yLCByb2JvdC5wb3NpdGlvbi55ICsgaW1nU2l6ZS8yKVxuXHRcdFx0XHRcdFx0Y29udGFpbmVyLmFkZENoaWxkKHJvYm90KTtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdoZXJlJywgcGxheWVyLm5hbWUpXG5cdFx0XHRcdFx0XHQvLyByb2JvdC5hbmNob3IueCA9IGltZ1NpemUvMjtcblx0XHRcdFx0XHRcdC8vIHJvYm90LmFuY2hvci55ID0gaW1nU2l6ZS8yO1xuXHRcdFx0XHRcdFx0Y29udGFpbmVyLnJvdGF0aW9uID0gTWF0aC5QSS8yXG5cblx0XHRcdFx0XHRcdHN0YWdlLmFkZENoaWxkKGNvbnRhaW5lcilcblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyByb2JvdC5wb3NpdGlvbi54IC09aW1nU2l6ZS8yXG5cdFx0XHRcdFx0Ly8gcm9ib3QucG9zaXRpb24ueSAtPSBpbWdTaXplLzI7XG5cdFx0XHRcdFx0cmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIG1vdmVSb2JvdCgpIHtcblx0XHRcdFx0XHRpZighdHVybiAmJiByb2JvdC5wb3NpdGlvbi54ID49IGltZ1NpemUgKiBwbGF5ZXIubG9jYXRpb25bMF0pIHtcblx0XHRcdFx0ICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZVJvYm90KTtcblx0XHRcdFx0ICAgICAgICByb2JvdC5wb3NpdGlvbi54IC09IDE7XG5cdFx0XHRcdCAgICAgICAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcblx0XHRcdFx0ICBcdH0gXHRcdFxuXHRcdFx0XHR9XHRcblx0XHRcdH0pXG5cdFx0fVxuXG5cblx0XHRidWlsZFRpbGVzKCk7XG5cdFx0ZHJhd0RvY2tzKCk7XG5cdFx0ZHJhd0RvY2tMaW5lKCk7XG5cdFx0ZHJhd0xhc2VycygpO1xuXHRcdGRyYXdSb2JvdHMocGxheWVycyk7XG5cdFx0Y2FyZE1vdmUocGxheWVyQ2FyZE1vdmUpO1xuXHRcdC8vIG5ld0xvY2F0aW9uKHBsYXllckJvYXJkTW92ZSk7XG5cblx0XHRmdW5jdGlvbiBidWlsZE1hcCgpe1xuXHRcdCAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcblx0XHQgIHJlcXVlc3RBbmltYXRpb25GcmFtZShidWlsZE1hcCk7XG5cdFx0fVxuXHRcdGlmKCRzY29wZS5nYW1lKSB7XG5cblx0XHRcdGJ1aWxkTWFwKCk7XG5cdFx0fVxuXHR9XG5cblxufSk7XG5cbmZ1bmN0aW9uIHJvYm90SW1hZ2UgKHJvYm90TmFtZSkge1xuXHRyZXR1cm4gcm9ib3ROYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvIC9nLCcnKSArICcucG5nJztcbn1cblxuXG5cbi8qIGJlYXJpbmdzXG5cblstMSwwXSBOXG5bMCwgMV0gRVxuWzAsIC0xXSBXXG5bMSwgMF0gU1xuXG4qLyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcbiAgICAgIHVybDogJy9nYW1lLzpnYW1lSWQvOnBsYXllcklkJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2dhbWUvZ2FtZS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdHYW1lQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRoZUdhbWU6IGZ1bmN0aW9uKEdhbWVGYWN0b3J5LCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICByZXR1cm4gR2FtZUZhY3RvcnkuZ2V0R2FtZSgkc3RhdGVQYXJhbXMuZ2FtZUlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJ1xuICAgIH0pO1xufSk7IiwiYXBwLmNvbnRyb2xsZXIoXCJMb2JieUNvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHNjb3BlLCBGaXJlYmFzZUZhY3RvcnkpIHtcblxuXHR2YXIgdGVzdGtleSA9ICc1NmY4OGZjYzA2ZjIwMGFmMjVhMGE1ZjknXG5cdFxuXHR2YXIgYWxsR2FtZXMgPSBGaXJlYmFzZUZhY3RvcnkuZ2V0QmFzZSgpXG5cdCRzY29wZS5nYW1lcyA9IGFsbEdhbWVzXG5cdC8vIGNvbnNvbGUubG9nKGFsbEdhbWVzKVxuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpe1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9iYnknLCB7XG5cdFx0dXJsOiAnL2xvYmJ5Jyxcblx0XHRjb250cm9sbGVyOiAnTG9iYnlDb250cm9sbGVyJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2xvYmJ5L2xvYmJ5Lmh0bWwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGJvYXJkczogZnVuY3Rpb24oQm9hcmRGYWN0b3J5KSB7XG5cdFx0XHRcdHJldHVybiBCb2FyZEZhY3RvcnkuZ2V0QWxsQm9hcmRzKClcblx0XHRcdH1cblx0XHR9XG5cdH0pXG59KSIsImFwcC5jb250cm9sbGVyKFwiSG9zdENvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHNjb3BlLCBnYW1lLCAkc3RhdGVQYXJhbXMsIEZpcmViYXNlRmFjdG9yeSwgR2FtZUZhY3RvcnksICRzdGF0ZSkge1xuXG5cdHZhciBnYW1lSUQgPSAkc3RhdGVQYXJhbXMuaWRcblx0dmFyIGhvc3RJRCA9ICRzdGF0ZVBhcmFtcy5ob3N0SWRcblxuXHR2YXIgbG9jYWxHYW1lUGxheWVycyA9IEZpcmViYXNlRmFjdG9yeS5nZXRDb25uZWN0aW9uKGdhbWVJRCArICcvZ2FtZScgKyAnL3BsYXllcnMnKVxuXHQkc2NvcGUucGxheWVycyA9IGxvY2FsR2FtZVBsYXllcnNcdFxuXG5cdCRzY29wZS5nYW1lID0gZ2FtZVxuXG5cdCRzY29wZS5zdGFydEdhbWUgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gR2FtZUZhY3Rvcnkuc3RhcnRHYW1lKGdhbWVJRClcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHJlc3BvbnNlJywgcmVzcG9uc2UpXG5cdFx0XHQkc3RhdGUuZ28oJ2dhbWUnLCB7Z2FtZUlkOiByZXNwb25zZSwgcGxheWVySWQ6IGhvc3RJRH0pXG5cdFx0fSlcblx0fVxuXG5cblxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKXtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvc3QnLCB7XG5cdFx0dXJsOiAnL2hvc3QvOmlkLzpob3N0SWQnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvaG9zdC9ob3N0Lmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdIb3N0Q29udHJvbGxlcicsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0Z2FtZTogZnVuY3Rpb24oR2FtZUZhY3RvcnksICRzdGF0ZVBhcmFtcykge1xuXHRcdFx0XHRyZXR1cm4gR2FtZUZhY3RvcnkuZ2V0R2FtZSgkc3RhdGVQYXJhbXMuaWQpXG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbWVtYmVyc09ubHknLCB7XG4gICAgICAgIHVybDogJy9tZW1iZXJzLWFyZWEnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxpbWcgbmctcmVwZWF0PVwiaXRlbSBpbiBzdGFzaFwiIHdpZHRoPVwiMzAwXCIgbmctc3JjPVwie3sgaXRlbSB9fVwiIC8+JyxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgU2VjcmV0U3Rhc2gpIHtcbiAgICAgICAgICAgIFNlY3JldFN0YXNoLmdldFN0YXNoKCkudGhlbihmdW5jdGlvbiAoc3Rhc2gpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3Rhc2ggPSBzdGFzaDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRhdGEuYXV0aGVudGljYXRlIGlzIHJlYWQgYnkgYW4gZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgLy8gdGhhdCBjb250cm9scyBhY2Nlc3MgdG8gdGhpcyBzdGF0ZS4gUmVmZXIgdG8gYXBwLmpzLlxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmZhY3RvcnkoJ1NlY3JldFN0YXNoJywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICB2YXIgZ2V0U3Rhc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9zZWNyZXQtc3Rhc2gnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRTdGFzaDogZ2V0U3Rhc2hcbiAgICB9O1xuXG59KTsiLCJhcHAuY29udHJvbGxlcihcIldhaXRpbmdSb29tQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsIGdhbWUsICRzdGF0ZVBhcmFtcywgUGxheWVyRmFjdG9yeSwgRmlyZWJhc2VGYWN0b3J5LCAkc3RhdGUpIHtcblxuXHQkc2NvcGUuZ2FtZUlEID0gJHN0YXRlUGFyYW1zLmlkXG5cblx0Y29uc29sZS5sb2coJHNjb3BlLmdhbWVJRClcblxuXHQkc2NvcGUucGxheWVycyA9IEZpcmViYXNlRmFjdG9yeS5nZXRDb25uZWN0aW9uKCRzY29wZS5nYW1lSUQgKyAnL2dhbWUnICsgJy9wbGF5ZXJzJylcblxuXHQkc2NvcGUubG9jYWxHYW1lID0gRmlyZWJhc2VGYWN0b3J5LmdldENvbm5lY3Rpb24oJHNjb3BlLmdhbWVJRCArICcvZ2FtZScgKyAnL3N0YXRlJylcblx0Y29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHN0YXRlJywgJHNjb3BlLmxvY2FsR2FtZSlcblxuXHQkc2NvcGUuZ2FtZSA9IGdhbWVcblx0JHNjb3BlLnJvYm90cyA9IFt7bmFtZTogXCJTcGluIEJvdFwiLCBpbWdVcmw6IFwiL2ltZy9yb2JvdHMvc3BpbmJvdC5qcGdcIn0sIHtuYW1lOiBcIlR3b25reVwiLCBpbWdVcmw6IFwiL2ltZy9yb2JvdHMvdHdvbmt5LmpwZ1wifSwge25hbWU6IFwiWm9vbSBCb3RcIiwgaW1nVXJsOiBcIi9pbWcvcm9ib3RzL3pvb21ib3QuanBnXCJ9XVxuXG5cdCRzY29wZS5DcmVhdGVQbGF5ZXIgPSBmdW5jdGlvbihwbGF5ZXIsIGdhbWVJRCkge1xuXHRcdHJldHVybiBQbGF5ZXJGYWN0b3J5LmNyZWF0ZVBsYXllcihwbGF5ZXIsICRzY29wZS5nYW1lSUQpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocGxheWVySW5mbykge1xuXHRcdFx0dmFyIGlkID0gcGxheWVySW5mby5wbGF5ZXJJZFxuXHRcdFx0JHNjb3BlLiR3YXRjaCgnbG9jYWxHYW1lLiR2YWx1ZScsIGZ1bmN0aW9uKHN0YXRlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSBsb2NhbCBnYW1lJywgJHNjb3BlLmxvY2FsR2FtZS4kdmFsdWUpXG5cdFx0XHRcdGNvbnNvbGUubG9nKCd0aGlzIGlzIHN0YXRlJywgc3RhdGUpXG5cdFx0XHRcdGlmIChzdGF0ZSA9PT0gJ2RlY2lzaW9uJykge1xuXHRcdFx0XHRcdCRzdGF0ZS5nbygnZ2FtZScsIHtnYW1lSWQ6ICRzY29wZS5nYW1lSUQsIHBsYXllcklkOiBpZH0pXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fSlcblx0fVxuXG5cblxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKXtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3dhaXRpbmdyb29tJywge1xuXHRcdHVybDogJy93YWl0aW5ncm9vbS86aWQnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvd2FpdGluZ3Jvb20vd2FpdGluZ3Jvb20uaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ1dhaXRpbmdSb29tQ29udHJvbGxlcicsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0Z2FtZTogZnVuY3Rpb24oR2FtZUZhY3RvcnksICRzdGF0ZVBhcmFtcykge1xuXHRcdFx0XHRjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgc3RhdGVQYXJhbXM6JywgJHN0YXRlUGFyYW1zKVxuXHRcdFx0XHRyZXR1cm4gR2FtZUZhY3RvcnkuZ2V0R2FtZSgkc3RhdGVQYXJhbXMuaWQpXG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxufSkiLCJhcHAuZmFjdG9yeSgnQm9hcmRGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuXHRyZXR1cm4ge1xuXHRcdGdldEFsbEJvYXJkczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2JvYXJkLycpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5kYXRhKVxuXHRcdH0sXG5cdFx0Z2V0T25lQm9hcmQ6IGZ1bmN0aW9uKGJvYXJkSWQpIHtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvYm9hcmQvJyArIGJvYXJkSWQpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5kYXRhKVxuXHRcdH1cblx0fVxufSkiLCJhcHAuZmFjdG9yeSgnRmlyZWJhc2VGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlT2JqZWN0KSB7XG5cblx0dmFyIEZpcmViYXNlRmFjdG9yeSA9IHt9O1xuXG5cdHZhciBiYXNlVXJsID0gXCJodHRwczovL3Jlc3BsZW5kZW50LXRvcmNoLTQzMjIuZmlyZWJhc2Vpby5jb20vXCI7XG5cdHZhciBiYXNlQ29ubmVjdGlvbiA9ICRmaXJlYmFzZU9iamVjdChuZXcgRmlyZWJhc2UoYmFzZVVybCkpXG5cblx0RmlyZWJhc2VGYWN0b3J5LmdldENvbm5lY3Rpb24gPSBmdW5jdGlvbihrZXkpIHtcblx0XHR2YXIgbG9jYWxDb25uZWN0aW9uID0gJGZpcmViYXNlT2JqZWN0KG5ldyBGaXJlYmFzZShiYXNlVXJsICsga2V5KSlcblx0XHRyZXR1cm4gbG9jYWxDb25uZWN0aW9uXG5cdH1cblxuXHRGaXJlYmFzZUZhY3RvcnkuZ2V0QmFzZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBiYXNlQ29ubmVjdGlvblxuXHR9XG5cblx0cmV0dXJuIEZpcmViYXNlRmFjdG9yeVxuXG59KSIsImFwcC5mYWN0b3J5KCdGdWxsc3RhY2tQaWNzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBbXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjdnQlh1bENBQUFYUWNFLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL2ZiY2RuLXNwaG90b3MtYy1hLmFrYW1haWhkLm5ldC9ocGhvdG9zLWFrLXhhcDEvdDMxLjAtOC8xMDg2MjQ1MV8xMDIwNTYyMjk5MDM1OTI0MV84MDI3MTY4ODQzMzEyODQxMTM3X28uanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLUxLVXNoSWdBRXk5U0suanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNzktWDdvQ01BQWt3N3kuanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLVVqOUNPSUlBSUZBaDAuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNnlJeUZpQ0VBQXFsMTIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRS1UNzVsV0FBQW1xcUouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRXZaQWctVkFBQWs5MzIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRWdOTWVPWElBSWZEaEsuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRVF5SUROV2dBQXU2MEIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQ0YzVDVRVzhBRTJsR0ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWVWdzVTV29BQUFMc2ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWFKSVA3VWtBQWxJR3MuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQVFPdzlsV0VBQVk5RmwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLU9RYlZyQ01BQU53SU0uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9COWJfZXJ3Q1lBQXdSY0oucG5nOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNVBUZHZuQ2NBRUFsNHguanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNHF3QzBpQ1lBQWxQR2guanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CMmIzM3ZSSVVBQTlvMUQuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cd3BJd3IxSVVBQXZPMl8uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cc1NzZUFOQ1lBRU9oTHcuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSjR2TGZ1VXdBQWRhNEwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSTd3empFVkVBQU9QcFMuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSWRIdlQyVXNBQW5uSFYuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DR0NpUF9ZV1lBQW83NVYuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSVM0SlBJV0lBSTM3cXUuanBnOmxhcmdlJ1xuICAgIF07XG59KTtcbiIsImFwcC5mYWN0b3J5KCdHYW1lRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdHZhciBHYW1lRmFjdG9yeSA9IHt9O1xuXG5cdEdhbWVGYWN0b3J5LmNyZWF0ZVBsYXllckFuZEdhbWUgPSBmdW5jdGlvbihkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZ2FtZS8nLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0cmV0dXJuIHJlcy5kYXRhXG5cdFx0fSlcblx0fVxuXG5cdEdhbWVGYWN0b3J5LmdldEdhbWUgPSBmdW5jdGlvbihnYW1lSWQpe1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZ2FtZS8nICsgZ2FtZUlkKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHRyZXR1cm4gcmVzLmRhdGFcblx0XHR9KTtcblx0fVxuXG5cdEdhbWVGYWN0b3J5LnN0YXJ0R2FtZSA9IGZ1bmN0aW9uKGdhbWVJZCkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZ2FtZS8nICsgZ2FtZUlkICsgJy9zdGFydCcpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRyZXR1cm4gcmVzLmRhdGFcblx0XHR9KVxuXHR9XG5cblx0cmV0dXJuIEdhbWVGYWN0b3J5O1xufSkiLCJhcHAuZmFjdG9yeSgnUGxheWVyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG5cblx0dmFyIFBsYXllckZhY3RvcnkgPSB7fTtcblxuXHRQbGF5ZXJGYWN0b3J5LmNyZWF0ZVBsYXllciA9IGZ1bmN0aW9uKGRhdGEsIGlkKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcGxheWVyLycsIHtwYXJhbXM6e1wiZGF0YVwiOiBkYXRhLCBcImlkXCI6IGlkfX0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRyZXR1cm4gcmVzLmRhdGFcblx0XHR9KVxuXHR9XG5cblx0cmV0dXJuIFBsYXllckZhY3RvcnlcblxufSkiLCJhcHAuZmFjdG9yeSgnUmFuZG9tR3JlZXRpbmdzJywgZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGdldFJhbmRvbUZyb21BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgcmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV07XG4gICAgfTtcblxuICAgIHZhciBncmVldGluZ3MgPSBbXG4gICAgICAgICdIZWxsbywgd29ybGQhJyxcbiAgICAgICAgJ0F0IGxvbmcgbGFzdCwgSSBsaXZlIScsXG4gICAgICAgICdIZWxsbywgc2ltcGxlIGh1bWFuLicsXG4gICAgICAgICdXaGF0IGEgYmVhdXRpZnVsIGRheSEnLFxuICAgICAgICAnSVxcJ20gbGlrZSBhbnkgb3RoZXIgcHJvamVjdCwgZXhjZXB0IHRoYXQgSSBhbSB5b3Vycy4gOiknLFxuICAgICAgICAnVGhpcyBlbXB0eSBzdHJpbmcgaXMgZm9yIExpbmRzYXkgTGV2aW5lLicsXG4gICAgICAgICfjgZPjgpPjgavjgaHjga/jgIHjg6bjg7zjgrbjg7zmp5jjgIInLFxuICAgICAgICAnV2VsY29tZS4gVG8uIFdFQlNJVEUuJyxcbiAgICAgICAgJzpEJyxcbiAgICAgICAgJ1llcywgSSB0aGluayB3ZVxcJ3ZlIG1ldCBiZWZvcmUuJyxcbiAgICAgICAgJ0dpbW1lIDMgbWlucy4uLiBJIGp1c3QgZ3JhYmJlZCB0aGlzIHJlYWxseSBkb3BlIGZyaXR0YXRhJyxcbiAgICAgICAgJ0lmIENvb3BlciBjb3VsZCBvZmZlciBvbmx5IG9uZSBwaWVjZSBvZiBhZHZpY2UsIGl0IHdvdWxkIGJlIHRvIG5ldlNRVUlSUkVMIScsXG4gICAgXTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdyZWV0aW5nczogZ3JlZXRpbmdzLFxuICAgICAgICBnZXRSYW5kb21HcmVldGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFJhbmRvbUZyb21BcnJheShncmVldGluZ3MpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdjdHJscGFuZWwnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9nYW1lL2N0cmxQYW5lbC9jdHJscGFuZWwuaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgIFx0Z2FtZTogJz0nXG4gICAgICAgIH1cbiAgICB9XG59KTsiLCJhcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCdcbiAgICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdIb21lJywgc3RhdGU6ICdob21lJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdBYm91dCcsIHN0YXRlOiAnbG9iYnknIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0RvY3VtZW50YXRpb24nLCBzdGF0ZTogJ2RvY3MnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ01lbWJlcnMgT25seScsIHN0YXRlOiAnbWVtYmVyc09ubHknLCBhdXRoOiB0cnVlIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
