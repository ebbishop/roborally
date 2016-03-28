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

// window.start = function(){
//   document.getElementById("board").appendChild(renderer.view);
// }

// var stage = new PIXI.Stage(0x66ff99);
// var renderer = new PIXI.CanvasRenderer(640,480);

// //all image files are 150px. Do not change this number!
// var imgSizeActual = 150

// //factor to rescale images by. This number can be changed
// var imgScale = 3.75

// var imgSize = imgSizeActual/imgScale
// var cols = 12;
// var rows = 16;
// var board = {
//           col0: [1, 13, 5, 11, 5, 1, 1, 5, 13, 5, 1, 30, 1, 1, 1, 1],
//           col1: [4, 100, 1, 11, 1, 1, 1, 90, 13, 1, 52, 2, 1, 1, 5, 1],
//           col2: [2, 13, 36, 11, 1, 60, 1, 1, 13, 60, 1, 1, 2, 1, 1, 4],
//           col3: [1, 13, 4, 1, 40, 41, 96, 1, 41, 10, 10, 10, 1, 1, 5, 1],
//           col4: [2, 13, 93, 71, 1, 1, 13, 1, 1, 50, 1, 4, 2, 1, 1, 4],
//           col5: [12, 15, 41, 71, 1, 1, 13, 60, 93, 1, 5, 1, 1, 1, 5, 1],
//           col6: [10, 10, 40, 71, 1, 36, 22, 10, 40, 10, 10, 10, 1, 1, 5, 1],
//           col7: [2, 1, 1, 71, 1, 12, 41, 1, 3, 36, 1, 4, 2, 1, 5, 4],
//           col8: [1, 1, 1, 71, 1, 8, 11, 1, 1, 60, 1, 1, 1, 1, 1, 1],
//           col9: [2, 1, 3, 87, 70, 74, 11, 1, 13, 13, 1, 51, 2, 1, 5, 4],
//           col10: [1, 60, 4, 71, 1, 88, 11, 1, 13, 19, 10, 10, 1, 1, 1, 1],
//           col11: [30, 1, 3, 71, 3, 73, 11, 53, 73, 3, 1, 1, 1, 1, 5, 1]
//         }

// var boardArr = [];

// function createBoardArr (boardObj) {
//   for(var key in board) {
//     if(key.slice(0,3) === 'col') boardArr.push(board[key])
//   }
//   return boardArr;
// }

// function drawDockLine() {
//   var line = new PIXI.Graphics;
//   line.lineStyle(4, 0x000000, 1);
//   line.moveTo(12*imgSizeActual/imgScale, 0)
//   line.lineTo(12*imgSizeActual/imgScale, 12*imgSizeActual/imgScale)

//   stage.addChild(line)
// }

// function buildTiles() {
//   for (var col = 0; col < cols; col ++){
//     for (var row = 0; row < rows; row ++){
//       var tileSrc = '/img/tiles/' + boardArr[col][row] + '.jpg';
//                                                           //150x150 is the actual image size
//       var tile = new PIXI.extras.TilingSprite.fromImage(tileSrc, imgSizeActual, imgSizeActual)

//       tile.position.x = imgSize*row
//       tile.position.y = imgSize*cols - imgSize - imgSize * col;
//       //rescales the 150px tile image to be 4 times smaller
//       tile.scale.set(1/imgScale, 1/imgScale);

//       stage.addChild(tile)
//     }
//   }
// }

// function buildMap(){
//   createBoardArr();
//   buildTiles();
//   drawDockLine();
// }

// function init(){
//   renderer.render(stage);
// }

// buildMap();

app.controller('GameCtrl', function ($scope, $state, theGame, $q) {

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
        var players = [{ name: "player3", location: [14, 3], bearing: [-1, 0], robot: "Twonky", priorityVal: null }, { name: "player1", location: [14, 5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: null }, { name: "player2", location: [14, 8], bearing: [-1, 0], robot: "Spin Bot", priorityVal: null }];

        var oneRegister = [[//cardmove1,
        { name: "player3", location: [15, 3], bearing: [-1, 0], robot: "Twonky", priorityVal: 800 }, { name: "player1", location: [12, 5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: 500 }, { name: "player2", location: [11, 8], bearing: [-1, 0], robot: "Spin Bot", priorityVal: 200 }], [// boardmove1,
        { name: "player3", location: [15, 4], bearing: [-1, 0], robot: "Twonky", priorityVal: 800 }, { name: "player1", location: [12, 5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: 500 }, { name: "player2", location: [10, 8], bearing: [-1, 0], robot: "Spin Bot", priorityVal: 200 }], [//cardmove2,
        { name: "player3", location: [15, 4], bearing: [0, 1], robot: "Twonky", priorityVal: 800 }, { name: "player1", location: [12, 5], bearing: [0, -1], robot: "Hammer Bot", priorityVal: 500 }, { name: "player2", location: [8, 8], bearing: [-1, 0], robot: "Spin Bot", priorityVal: 200 }], [//boardmove2
        { name: "player3", location: [15, 5], bearing: [0, 1], robot: "Twonky", priorityVal: 800 }, { name: "player1", location: [12, 5], bearing: [0, -1], robot: "Hammer Bot", priorityVal: 500 }, { name: "player2", location: [8, 8], bearing: [0, -1], robot: "Spin Bot", priorityVal: 200 }], [//cardmove3,
        { name: "player3", location: [15, 3], bearing: [0, 1], robot: "Twonky", priorityVal: 800 }, { name: "player1", location: [12, 5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: 500 }, { name: "player2", location: [8, 8], bearing: [0, 1], robot: "Spin Bot", priorityVal: 200 }], [//boardmove3
        { name: "player3", location: [15, 4], bearing: [0, 1], robot: "Twonky", priorityVal: 800 }, { name: "player1", location: [12, 5], bearing: [0, -1], robot: "Hammer Bot", priorityVal: 500 }, { name: "player2", location: [8, 8], bearing: [-1, 0], robot: "Spin Bot", priorityVal: 200 }], [//cardmove4
        { name: "player3", location: [15, 5], bearing: [0, 1], robot: "Twonky", priorityVal: 800 }, { name: "player1", location: [12, 5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: 500 }, { name: "player2", location: [8, 9], bearing: [-1, 0], robot: "Spin Bot", priorityVal: 200 }], [//boardmove4,
        { name: "player3", location: [15, 3], bearing: [0, 1], robot: "Twonky", priorityVal: 800 }, { name: "player1", location: [12, 5], bearing: [-1, 0], robot: "Hammer Bot", priorityVal: 500 }, { name: "player2", location: [8, 10], bearing: [-1, 0], robot: "Spin Bot", priorityVal: 200 }]];

        /* bearings
        	[-1,0] N
        [0, 1] E
        [0, -1] W
        [1, 0] S
        	*/

        var robotHash = {};

        // var flattenedRegister = _.flatten(oneRegister)

        function drawRobots(initial) {
            initial.forEach(function (player, idx) {
                if (robotHash[player.name] === undefined) createSprite();

                function createSprite() {
                    var robotImg = robotImage(player.robot);
                    var robot = new Sprite(PIXI.Texture.fromImage(robotImg));
                    robot.position.x = imgSize * player.location[0];
                    robot.position.y = imgSize * player.location[1];
                    robot.scale.set(1 / imgScale, 1 / imgScale);

                    stage.addChild(robot);
                    robotHash[player.name] = robot;
                    robotHash[player.name].bearing = player.bearing;
                    renderer.render(stage);
                }
            });
        }

        function runOneRegister(register) {
            move(_.flatten(register)).then(function () {
                console.log(robotHash);
            });
        }

        function move(playerObjs) {
            return playerObjs.reduce(function (acc, player, idx) {
                var robot = robotHash[player.name];
                var turn = false;
                var direction;

                return acc.then(function () {
                    return turnAndMove();
                });

                function turnAndMove() {
                    return turnRobot().then(function () {

                        return promiseForMoveRobot();
                    });
                }

                function turnRobot() {
                    if (player.bearing[0] !== robot.bearing[0] && player.bearing[1] !== robot.bearing[1]) {
                        var degreesToRotate;
                        var direction;
                        var container;

                        var _ret = (function () {
                            var rotate = function rotate(resolve) {
                                if (robot.rotation <= degreesToRotate && direction == "clockwise" || direction == undefined) {
                                    direction = "clockwise";
                                    requestAnimationFrame(rotate.bind(null, resolve));
                                    robot.rotation += 0.1;
                                } else if (robot.rotation >= degreesToRotate) {
                                    direction = "counterclockwise";
                                    requestAnimationFrame(rotate.bind(null, resolve));
                                    robot.rotation -= 0.1;
                                } else {
                                    resolve();
                                }
                            };

                            var promiseForRotate = function promiseForRotate() {
                                return $q(function (resolve, reject) {
                                    rotate(resolve);
                                });
                            };

                            degreesToRotate = getRotation(robot.bearing, player.bearing);

                            robot.bearing = player.bearing;
                            //clockwise or counterclockwise

                            container = new Container();

                            container.position.x = robot.position.x + imgSize / 2;
                            container.position.y = robot.position.y + imgSize / 2;
                            container.pivot.set(robot.position.x + imgSize / 2, robot.position.y + imgSize / 2);
                            container.addChild(robot);
                            stage.addChild(container);
                            turn = true;
                            return {
                                v: promiseForRotate()
                            };
                        })();

                        if (typeof _ret === 'object') return _ret.v;
                    } else {
                        return $q.resolve();
                    }
                }

                function moveRobot(resolve) {
                    if (!turn && robot.position.x >= imgSize * player.location[0] && direction == 'north' || direction == undefined) {
                        direction = 'north';
                        requestAnimationFrame(moveRobot.bind(null, resolve));
                        robot.position.x -= 1;
                    } else if (!turn && robot.position.x <= imgSize * player.location[0]) {
                        direction = "south";
                        requestAnimationFrame(moveRobot.bind(null, resolve));
                        robot.position.x += 1;
                    } else if (!turn && robot.position.y <= imgSize * player.location[1]) {
                        direction = "west";
                        requestAnimationFrame(moveRobot.bind(null, resolve));
                        robot.position.y += 1;
                    } else if (!turn && robot.position.y >= imgSize & player.location[1] && direction == 'east') {
                        direction = 'east';
                        requestAnimationFrame(moveRobot.bind(null, resolve));
                        robot.position.y -= 1;
                    } else {
                        resolve();
                    }
                }
                function promiseForMoveRobot() {
                    return $q(function (resolve, reject) {
                        moveRobot(resolve);
                    });
                }
            }, $q.resolve());
        }

        // function promiseForMoving (oneMove) {
        // 	return $q(function(resolve, reject) {
        // 		move(oneMove);
        // 	});
        // }

        buildTiles();
        drawDocks();
        drawDockLine();
        drawLasers();
        drawRobots(players);
        runOneRegister(oneRegister);
        // console.log('robo hash', robotHash)

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
    return '/img/robots/' + robotName.toLowerCase().replace(/ /g, '') + 'Arrow.png';
}

function getRotation(orig, next) {
    if (orig[0] + next[0] === 0 || orig[1] + next[1] === 0) return Math.PI;else {
        var dot = -orig[0] * next[1] + orig[1] * next[0];
        var rad = Math.asin(dot);
        return rad;
    }
}

app.config(function ($stateProvider) {

    $stateProvider.state('game', {
        url: '/game/:gameId',
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

    var testkey = '1234';

    $scope.localConnection = FirebaseFactory.getConnection(testkey + '/game');

    $scope.games = ["game1", "game2", "game3", "game4"];

    $scope.info = ['game1 info', 'game2 info', 'game3 info', 'game4 info'];
});
app.config(function ($stateProvider) {
    $stateProvider.state('lobby', {
        url: '/lobby',
        controller: 'LobbyController',
        templateUrl: 'js/lobby/lobby.html'
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
(function () {

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

app.factory('BoardFactory', function ($http) {
    return {
        getBoard: function getBoard(boardId) {
            return $http.get('/api/board/' + boardId).then(function (response) {
                return response.data;
            });
        }
    };
});
app.factory('FirebaseFactory', function ($firebaseObject) {

    var FirebaseFactory = {};

    var baseUrl = "https://resplendent-torch-4322.firebaseio.com/";

    FirebaseFactory.getConnection = function (key) {
        var localConnection = $firebaseObject(new Firebase(baseUrl + key));
        return localConnection;
    };

    return FirebaseFactory;
});
app.factory('FullstackPics', function () {
    return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large', 'https://pbs.twimg.com/media/CJ4vLfuUwAAda4L.jpg:large', 'https://pbs.twimg.com/media/CI7wzjEVEAAOPpS.jpg:large', 'https://pbs.twimg.com/media/CIdHvT2UsAAnnHV.jpg:large', 'https://pbs.twimg.com/media/CGCiP_YWYAAo75V.jpg:large', 'https://pbs.twimg.com/media/CIS4JPIWIAI37qu.jpg:large'];
});

app.factory('GameFactory', function ($http) {

    var GameFactory = {};

    GameFactory.getGame = function (gameId) {
        return $http.get('/api/game/' + gameId).then(function (res) {
            return res.data;
        });
    };

    return GameFactory;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZG9jcy9kb2NzLmpzIiwiZ2FtZS9nYW1lLmNvbnRyb2xsZXIuanMiLCJnYW1lL2dhbWUuc3RhdGUuanMiLCJob21lL2hvbWUuanMiLCJsb2JieS9sb2JieS5jb250cm9sbGVyLmpzIiwibG9iYnkvbG9iYnkuc3RhdGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsIm1lbWJlcnMtb25seS9tZW1iZXJzLW9ubHkuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImNvbW1vbi9mYWN0b3JpZXMvQm9hcmRGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GaXJlYmFzZUZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL0Z1bGxzdGFja1BpY3MuanMiLCJjb21tb24vZmFjdG9yaWVzL0dhbWVGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJnYW1lL2N0cmxwYW5lbC9jdHJscGFuZWwuZGlyZWN0aXZlLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJjb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQTs7QUFFQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxRQUFBLDRCQUFBLEdBQUEsU0FBQSw0QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtLQUNBLENBQUE7Ozs7QUFJQSxjQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsNEJBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7QUFFQSxZQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7O0FBR0EsYUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQ25EQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUE7OztBQUdBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2hCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0xBLEdBQUEsQ0FBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUE7O0FBRUEsYUFBQSxhQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsWUFBQSxHQUFBLEdBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGVBQUEsTUFBQSxDQUFBO0tBQ0E7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTs7O0FBR0EsUUFBQSxTQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUE7UUFDQSxrQkFBQSxHQUFBLElBQUEsQ0FBQSxrQkFBQTtRQUNBLE1BQUEsR0FBQSxJQUFBLENBQUEsTUFBQTtRQUNBLFNBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFNBQUE7UUFDQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTs7QUFFQSxVQUFBLENBQ0EsR0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLFFBQUEsUUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLGFBQUEsR0FBQSxRQUFBLENBQUE7O0FBRUEsYUFBQSxLQUFBLEdBQUE7O0FBRUEsWUFBQSxLQUFBLEdBQUEsSUFBQSxTQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsUUFBQSxHQUFBLGtCQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsRUFBQSxPQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLGNBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7O0FBSUEsWUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLGlCQUFBLFlBQUEsR0FBQTtBQUNBLGdCQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEdBQUEsYUFBQSxHQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsR0FBQSxhQUFBLEdBQUEsUUFBQSxFQUFBLEVBQUEsR0FBQSxhQUFBLEdBQUEsUUFBQSxDQUFBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7U0FDQTs7QUFFQSxpQkFBQSxVQUFBLEdBQUE7QUFDQSxpQkFBQSxJQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQTtBQUNBLHFCQUFBLElBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBO0FBQ0Esd0JBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBOztBQUVBLHdCQUFBLElBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLHdCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxJQUFBLEdBQUEsT0FBQSxHQUFBLE9BQUEsR0FBQSxHQUFBLENBQUE7O0FBRUEsd0JBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQSxDQUFBOztBQUVBLHlCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2lCQUNBO2FBQ0E7U0FDQTtBQUNBLGlCQUFBLFNBQUEsR0FBQTtBQUNBLGlCQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxvQkFBQSxPQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLFlBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0E7O0FBRUEsaUJBQUEsVUFBQSxHQUFBO0FBQ0EsaUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLG9CQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLG9CQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBLG9CQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLHlCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHlCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSx1QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO2lCQUNBLE1BQ0EsSUFBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLHlCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHlCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSx1QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO2lCQUNBLE1BQ0EsSUFBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSx5QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtpQkFDQSxNQUNBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHlCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSx1QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7aUJBQ0E7O0FBRUEsb0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxHQUFBLE9BQUEsRUFBQSxLQUFBLEdBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxFQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsQ0FBQTs7QUFFQSxxQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTthQUVBO1NBQ0E7O0FBR0EsWUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsQ0FBQTs7QUFFQSxZQUFBLE9BQUEsR0FBQSxDQUNBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsWUFBQSxXQUFBLEdBQUEsQ0FDQTtBQUNBLFVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxDQUNBLEVBRUE7QUFDQSxVQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsQ0FDQSxFQUVBO0FBQ0EsVUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxDQUNBLEVBRUE7QUFDQSxVQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLENBQ0EsRUFDQTtBQUNBLFVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLENBQ0EsRUFFQTtBQUNBLFVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsQ0FDQSxFQUNBO0FBQ0EsVUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxDQUNBLEVBQ0E7QUFDQSxVQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLENBQ0EsQ0FDQSxDQUFBOzs7Ozs7Ozs7QUFXQSxZQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7Ozs7QUFJQSxpQkFBQSxVQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLENBQUE7O0FBRUEseUJBQUEsWUFBQSxHQUFBO0FBQ0Esd0JBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSx3QkFBQSxLQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHlCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHlCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHlCQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxRQUFBLENBQUEsQ0FBQTs7QUFFQSx5QkFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLDZCQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLDZCQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsNEJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7aUJBQ0E7YUFDQSxDQUFBLENBQUE7U0FDQTs7QUFFQSxpQkFBQSxjQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBOztBQUVBLGlCQUFBLElBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxtQkFBQSxVQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLEdBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxvQkFBQSxTQUFBLENBQUE7O0FBRUEsdUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsMkJBQUEsV0FBQSxFQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBOztBQUVBLHlCQUFBLFdBQUEsR0FBQTtBQUNBLDJCQUFBLFNBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBOztBQUVBLCtCQUFBLG1CQUFBLEVBQUEsQ0FBQTtxQkFDQSxDQUFBLENBQUE7aUJBQ0E7O0FBRUEseUJBQUEsU0FBQSxHQUFBO0FBQ0Esd0JBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTs0QkFDQSxlQUFBOzRCQUVBLFNBQUE7NEJBRUEsU0FBQTs7O2dDQVNBLE1BQUEsR0FBQSxTQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxvQ0FBQSxLQUFBLENBQUEsUUFBQSxJQUFBLGVBQUEsSUFBQSxTQUFBLElBQUEsV0FBQSxJQUFBLFNBQUEsSUFBQSxTQUFBLEVBQUE7QUFDQSw2Q0FBQSxHQUFBLFdBQUEsQ0FBQTtBQUNBLHlEQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHlDQUFBLENBQUEsUUFBQSxJQUFBLEdBQUEsQ0FBQTtpQ0FDQSxNQUNBLElBQUEsS0FBQSxDQUFBLFFBQUEsSUFBQSxlQUFBLEVBQUE7QUFDQSw2Q0FBQSxHQUFBLGtCQUFBLENBQUE7QUFDQSx5REFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx5Q0FBQSxDQUFBLFFBQUEsSUFBQSxHQUFBLENBQUE7aUNBQ0EsTUFDQTtBQUNBLDJDQUFBLEVBQUEsQ0FBQTtpQ0FDQTs2QkFDQTs7Z0NBRUEsZ0JBQUEsR0FBQSxTQUFBLGdCQUFBLEdBQUE7QUFDQSx1Q0FBQSxFQUFBLENBQUEsVUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ0EsMENBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtpQ0FDQSxDQUFBLENBQUE7NkJBQ0E7O0FBakNBLDJDQUFBLEdBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQTs7QUFDQSxpQ0FBQSxDQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBOzs7QUFHQSxxQ0FBQSxHQUFBLElBQUEsU0FBQSxFQUFBOztBQUNBLHFDQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EscUNBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxxQ0FBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxxQ0FBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLGlDQUFBLENBQUEsUUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0NBQUEsR0FBQSxJQUFBLENBQUE7QUFDQTttQ0FBQSxnQkFBQSxFQUFBOzhCQUFBOzs7O3FCQXVCQSxNQUNBO0FBQ0EsK0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO3FCQUNBO2lCQUNBOztBQUVBLHlCQUFBLFNBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSx3QkFBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsSUFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxTQUFBLElBQUEsT0FBQSxJQUFBLFNBQUEsSUFBQSxTQUFBLEVBQUE7QUFDQSxpQ0FBQSxHQUFBLE9BQUEsQ0FBQTtBQUNBLDZDQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLDZCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7cUJBQ0EsTUFDQSxJQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxJQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsaUNBQUEsR0FBQSxPQUFBLENBQUE7QUFDQSw2Q0FBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSw2QkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO3FCQUNBLE1BQ0EsSUFBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsSUFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGlDQUFBLEdBQUEsTUFBQSxDQUFBO0FBQ0EsNkNBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsNkJBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtxQkFDQSxNQUNBLElBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLElBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsU0FBQSxJQUFBLE1BQUEsRUFBQTtBQUNBLGlDQUFBLEdBQUEsTUFBQSxDQUFBO0FBQ0EsNkNBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsNkJBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtxQkFDQSxNQUFBO0FBQ0EsK0JBQUEsRUFBQSxDQUFBO3FCQUNBO2lCQUNBO0FBQ0EseUJBQUEsbUJBQUEsR0FBQTtBQUNBLDJCQUFBLEVBQUEsQ0FBQSxVQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxpQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO3FCQUNBLENBQUEsQ0FBQTtpQkFFQTthQUVBLEVBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQUE7U0FDQTs7Ozs7Ozs7QUFXQSxrQkFBQSxFQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUE7QUFDQSxvQkFBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7O0FBR0EsaUJBQUEsUUFBQSxHQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxpQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxZQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUE7O0FBRUEsb0JBQUEsRUFBQSxDQUFBO1NBQ0E7S0FDQTtDQUdBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLFVBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxXQUFBLGNBQUEsR0FBQSxTQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxFQUFBLENBQUEsR0FBQSxXQUFBLENBQUE7Q0FDQTs7QUFFQSxTQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxPQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsS0FDQTtBQUNBLFlBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsR0FBQSxDQUFBO0tBQ0E7Q0FDQTs7QUM3VkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsZUFBQTtBQUNBLG1CQUFBLEVBQUEsb0JBQUE7QUFDQSxrQkFBQSxFQUFBLFVBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLGlCQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1pBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTEEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGVBQUEsRUFBQTs7QUFFQSxRQUFBLE9BQUEsR0FBQSxNQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLGVBQUEsR0FBQSxlQUFBLENBQUEsYUFBQSxDQUFBLE9BQUEsR0FBQSxPQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLElBQUEsR0FBQSxDQUFBLFlBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFlBQUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDVkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxpQkFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNOQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxjQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDRCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0JBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGVBQUE7QUFDQSxnQkFBQSxFQUFBLG1FQUFBO0FBQ0Esa0JBQUEsRUFBQSxvQkFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsdUJBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7O0FBR0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLEdBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLFFBQUE7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDL0JBLENBQUEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBOzs7O0FBSUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsVUFBQSxLQUFBLElBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7Ozs7O0FBS0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7O0FDcElBLEdBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsV0FBQTtBQUNBLGdCQUFBLEVBQUEsa0JBQUEsT0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLEdBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQTt1QkFBQSxRQUFBLENBQUEsSUFBQTthQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ1BBLEdBQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLGVBQUEsRUFBQTs7QUFFQSxRQUFBLGVBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxPQUFBLEdBQUEsZ0RBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLGFBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsZUFBQSxHQUFBLGVBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsZUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxXQUFBLGVBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2JBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLENBQ0EsdURBQUEsRUFDQSxxSEFBQSxFQUNBLGlEQUFBLEVBQ0EsaURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxDQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDN0JBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxlQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFlBQUEsR0FBQSxNQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxtQkFBQSxHQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxXQUFBLFdBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ1pBLEdBQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBOztBQUVBLFFBQUEsa0JBQUEsR0FBQSxTQUFBLGtCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFFBQUEsU0FBQSxHQUFBLENBQ0EsZUFBQSxFQUNBLHVCQUFBLEVBQ0Esc0JBQUEsRUFDQSx1QkFBQSxFQUNBLHlEQUFBLEVBQ0EsMENBQUEsRUFDQSxjQUFBLEVBQ0EsdUJBQUEsRUFDQSxJQUFBLEVBQ0EsaUNBQUEsRUFDQSwwREFBQSxFQUNBLDZFQUFBLENBQ0EsQ0FBQTs7QUFFQSxXQUFBO0FBQ0EsaUJBQUEsRUFBQSxTQUFBO0FBQ0EseUJBQUEsRUFBQSw2QkFBQTtBQUNBLG1CQUFBLGtCQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1QkEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxXQUFBLEVBQUEsWUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQ0FBQTtBQUNBLGFBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ1RBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLHlDQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBOztBQUVBLGlCQUFBLENBQUEsS0FBQSxHQUFBLENBQ0EsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsY0FBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSwyQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsMEJBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSwyQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLHlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsbUJBQUEsRUFBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtTQUVBOztLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZScsICdmaXJlYmFzZSddKTtcblxuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEZ1bGxzdGFja1BpY3MpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gXy5zaHVmZmxlKEZ1bGxzdGFja1BpY3MpO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb2NzJywge1xuICAgICAgICB1cmw6ICcvZG9jcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG9jcy9kb2NzLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsImFwcC5jb250cm9sbGVyKCdHYW1lQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCB0aGVHYW1lLCAkcSl7XG5cblx0JHNjb3BlLmdhbWUgPSB0aGVHYW1lO1xuXHQkc2NvcGUuYm9hcmRPYmogPSAkc2NvcGUuZ2FtZS5ib2FyZFxuXHQkc2NvcGUuZG9ja3MgPSAkc2NvcGUuZ2FtZS5ib2FyZC5kb2NrTG9jYXRpb25zXG5cdCRzY29wZS5sYXNlcnMgPSAkc2NvcGUuZ2FtZS5ib2FyZC5sYXNlckxvY2F0aW9uc1xuXHQvLyBjb25zb2xlLmxvZygkc2NvcGUubGFzZXJzKVxuXHRmdW5jdGlvbiBjb2xsZWN0T25lQ29sKG4pe1xuXHR2YXIga2V5ID0gJ2NvbCcgKyBuLnRvU3RyaW5nKCk7XG5cdHZhciBpZGVudHMgPSAkc2NvcGUuYm9hcmRPYmpba2V5XS5tYXAoZnVuY3Rpb24odGlsZSl7XG5cdCAgcmV0dXJuIHRpbGUuaWRlbnRpZmllcjtcblx0fSk7XG5cdHJldHVybiBpZGVudHM7XG5cdH1cblxuXHQkc2NvcGUuYm9hcmQgPSBbXTtcblx0Zm9yKHZhciBpID0gMDsgaSA8PSAxMTsgaSArKyl7XG5cdFx0JHNjb3BlLmJvYXJkLnB1c2goY29sbGVjdE9uZUNvbChpKSk7XG5cdH1cblx0Ly8gY29uc29sZS5sb2coJHNjb3BlLmRvY2tzKVxuXG5cdHZhciBDb250YWluZXIgPSBQSVhJLkNvbnRhaW5lcixcbiAgICBhdXRvRGV0ZWN0UmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcixcbiAgICBsb2FkZXIgPSBQSVhJLmxvYWRlcixcbiAgICByZXNvdXJjZXMgPSBQSVhJLmxvYWRlci5yZXNvdXJjZXMsXG4gICAgU3ByaXRlID0gUElYSS5TcHJpdGU7XG5cblx0bG9hZGVyXG4gIFx0LmFkZChcImltZy9zcHJpdGVzaGVldC5qc29uXCIpXG4gIFx0LmxvYWQoc2V0dXApO1xuXG4gIFx0dmFyIGlkID0gUElYSS5sb2FkZXIucmVzb3VyY2VzW1wiaW1nL3Nwcml0ZXNoZWV0Lmpzb25cIl0udGV4dHVyZXM7IFxuICAgIHZhciBpbWdTaXplQWN0dWFsID0gMTUwIFxuXHR2YXIgaW1nU2NhbGUgPSA0XG5cdHZhciBpbWdTaXplID0gaW1nU2l6ZUFjdHVhbC9pbWdTY2FsZVxuXG5cdGZ1bmN0aW9uIHNldHVwKCkge1xuXG5cdCAgICB2YXIgc3RhZ2UgPSBuZXcgQ29udGFpbmVyKCk7XG5cdCAgICB2YXIgcmVuZGVyZXIgPSBhdXRvRGV0ZWN0UmVuZGVyZXIoaW1nU2l6ZSoxNixpbWdTaXplKjEyKTtcblx0ICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmRDb250YWluZXJcIikuYXBwZW5kQ2hpbGQocmVuZGVyZXIudmlldylcblxuXG5cdFx0Ly9mYWN0b3IgdG8gcmVzY2FsZSBpbWFnZXMgYnkuIFRoaXMgbnVtYmVyIGNhbiBiZSBjaGFuZ2VkXG5cdFx0dmFyIGNvbHMgPSAxMjtcblx0XHR2YXIgcm93cyA9IDE2O1xuXG5cdFx0ZnVuY3Rpb24gZHJhd0RvY2tMaW5lKCkge1xuXHRcdCAgdmFyIGxpbmUgPSBuZXcgUElYSS5HcmFwaGljcztcblx0XHQgIGxpbmUubGluZVN0eWxlKDQsIDB4MDAwMDAwLCAxKTtcblx0XHQgIGxpbmUubW92ZVRvKDEyKmltZ1NpemVBY3R1YWwvaW1nU2NhbGUsIDApXG5cdFx0ICBsaW5lLmxpbmVUbygxMippbWdTaXplQWN0dWFsL2ltZ1NjYWxlLCAxMippbWdTaXplQWN0dWFsL2ltZ1NjYWxlKVxuXG5cdFx0ICBzdGFnZS5hZGRDaGlsZChsaW5lKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGJ1aWxkVGlsZXMoKSB7XG5cdFx0ICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBjb2xzOyBjb2wgKyspe1xuXHRcdCAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCByb3dzOyByb3cgKyspe1xuXHRcdCAgICAgIHZhciB0aWxlU3JjID0gJHNjb3BlLmJvYXJkW2NvbF1bcm93XSArICcuanBnJztcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8xNTB4MTUwIGlzIHRoZSBhY3R1YWwgaW1hZ2Ugc2l6ZVxuXHRcdCAgICAgIHZhciB0aWxlID0gbmV3IFNwcml0ZShyZXNvdXJjZXNbXCJpbWcvc3ByaXRlc2hlZXQuanNvblwiXS50ZXh0dXJlc1t0aWxlU3JjXSk7XG5cdFx0ICAgICAgXG5cdFx0ICAgICAgdGlsZS5wb3NpdGlvbi54ID0gaW1nU2l6ZSpyb3dcblx0XHQgICAgICB0aWxlLnBvc2l0aW9uLnkgPSBpbWdTaXplKmNvbHMgLSBpbWdTaXplIC0gaW1nU2l6ZSAqIGNvbDtcblx0XHQgICAgICAvL3Jlc2NhbGVzIHRoZSAxNTBweCB0aWxlIGltYWdlIHRvIGJlIDQgdGltZXMgc21hbGxlciBcblx0XHQgICAgICB0aWxlLnNjYWxlLnNldCgxL2ltZ1NjYWxlLCAxL2ltZ1NjYWxlKTtcblxuXHRcdCAgICAgIHN0YWdlLmFkZENoaWxkKHRpbGUpXG5cdFx0ICAgIH1cblx0XHQgIH1cblx0XHR9XG5cdFx0ZnVuY3Rpb24gZHJhd0RvY2tzKCkge1xuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8ICRzY29wZS5kb2Nrcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgZG9ja051bSA9IGkrMTtcblx0XHRcdFx0dmFyIGRvY2sgPSBuZXcgUElYSS5UZXh0KGRvY2tOdW0udG9TdHJpbmcoKSwge2ZvbnQgOiAnMjRweCBBcmlhbCcsIGZpbGwgOiAweDAwMDAwMCwgYWxpZ24gOiAnY2VudGVyJ30pXG5cdFx0XHRcdGRvY2sucG9zaXRpb24ueCA9ICRzY29wZS5kb2Nrc1tpXVswXSppbWdTaXplICsgMTM7XG5cdFx0XHRcdGRvY2sucG9zaXRpb24ueSA9ICRzY29wZS5kb2Nrc1tpXVsxXSppbWdTaXplICsgNTtcblx0XHRcdFx0c3RhZ2UuYWRkQ2hpbGQoZG9jayk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZHJhd0xhc2VycygpIHtcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCAkc2NvcGUubGFzZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBsaW5lID0gbmV3IFBJWEkuR3JhcGhpY3M7XG5cdFx0XHRcdHZhciB4RnJvbSwgeUZyb20sIHhUbywgeVRvO1xuXHRcdFx0XHRpZigkc2NvcGUubGFzZXJzW2ldWzNdID09PSBcImhcIiAmJiAkc2NvcGUubGFzZXJzW2ldWzBdWzBdID4gJHNjb3BlLmxhc2Vyc1tpXVtpXVsxXVswXSkge1xuXHRcdFx0XHRcdHhGcm9tID0gJHNjb3BlLmxhc2Vyc1tpXVswXVswXSBcblx0XHRcdFx0XHR5RnJvbSA9ICRzY29wZS5sYXNlcnNbaV1bMF1bMV0gKyAwLjVcblx0XHRcdFx0XHR4VG8gPSAkc2NvcGUubGFzZXJzW2ldWzFdWzBdIFxuXHRcdFx0XHRcdHlUbyA9ICRzY29wZS5sYXNlcnNbaV1bMV1bMV0gKyAwLjVcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKCRzY29wZS5sYXNlcnNbaV1bM10gPT09IFwiaFwiKSB7XG5cdFx0XHRcdFx0eEZyb20gPSAkc2NvcGUubGFzZXJzW2ldWzBdWzBdIFxuXHRcdFx0XHRcdHlGcm9tID0gJHNjb3BlLmxhc2Vyc1tpXVswXVsxXSArIDAuNVxuXHRcdFx0XHRcdHhUbyA9ICRzY29wZS5sYXNlcnNbaV1bMV1bMF0gXG5cdFx0XHRcdFx0eVRvID0gJHNjb3BlLmxhc2Vyc1tpXVsxXVsxXSArIDAuNVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYoJHNjb3BlLmxhc2Vyc1tpXVszXSA9PT0gXCJ2XCIgJiYgJHNjb3BlLmxhc2Vyc1tpXVswXVsxXSA+ICRzY29wZS5sYXNlcnNbaV1bMV1bMV0pIHtcblx0XHRcdFx0XHR4RnJvbSA9ICRzY29wZS5sYXNlcnNbaV1bMF1bMF0gKyAwLjVcblx0XHRcdFx0XHR5RnJvbSA9ICRzY29wZS5sYXNlcnNbaV1bMF1bMV0gXG5cdFx0XHRcdFx0eFRvID0gJHNjb3BlLmxhc2Vyc1tpXVsxXVswXSArIDAuNVxuXHRcdFx0XHRcdHlUbyA9ICRzY29wZS5sYXNlcnNbaV1bMV1bMV0gXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0eEZyb20gPSAkc2NvcGUubGFzZXJzW2ldWzBdWzBdICsgMC41XG5cdFx0XHRcdFx0eUZyb20gPSAkc2NvcGUubGFzZXJzW2ldWzBdWzFdIFxuXHRcdFx0XHRcdHhUbyA9ICRzY29wZS5sYXNlcnNbaV1bMV1bMF0gKyAwLjVcblx0XHRcdFx0XHR5VG8gPSAkc2NvcGUubGFzZXJzW2ldWzFdWzFdIFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGluZS5saW5lU3R5bGUoMSwgMHhmZjAwMDApXG5cdFx0XHRcdGxpbmUubW92ZVRvKHhGcm9tKmltZ1NpemUsIHlGcm9tKmltZ1NpemUpXG5cdFx0XHRcdGxpbmUubGluZVRvKHhUbyppbWdTaXplLCB5VG8qaW1nU2l6ZSlcblxuXHRcdFx0XHRzdGFnZS5hZGRDaGlsZChsaW5lKVxuXHRcdFx0ICAgIFxuXHRcdFx0fVxuXHRcdH1cblxuXG5cdFx0dmFyIHBsYXllcjEsIHBsYXllcjIsIHBsYXllcjM7XG5cdFx0Ly9zZWVkIGZvciBvcmlnaW5hbCBsb2NhdGlvblxuXHRcdHZhciBwbGF5ZXJzID0gW1xuXHRcdCAgeyBuYW1lOiBcInBsYXllcjNcIiwgbG9jYXRpb246IFsxNCwzXSwgYmVhcmluZzogWy0xLCAwXSwgcm9ib3Q6IFwiVHdvbmt5XCIsIHByaW9yaXR5VmFsOiBudWxsIH0sXG5cdFx0ICB7IG5hbWU6IFwicGxheWVyMVwiLCBsb2NhdGlvbjogWzE0LDVdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJIYW1tZXIgQm90XCIsIHByaW9yaXR5VmFsOiBudWxsIH0sXG5cdFx0ICB7IG5hbWU6IFwicGxheWVyMlwiLCBsb2NhdGlvbjogWzE0LDhdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJTcGluIEJvdFwiLCBwcmlvcml0eVZhbDogbnVsbCB9LFxuXHRcdF1cblxuXHRcdHZhciBvbmVSZWdpc3RlciA9IFtcblx0XHRcdFsgLy9jYXJkbW92ZTEsXG5cdFx0XHQgIHsgbmFtZTogXCJwbGF5ZXIzXCIsIGxvY2F0aW9uOiBbMTUsM10sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcIlR3b25reVwiLCBwcmlvcml0eVZhbDogODAwIH0sXG5cdFx0XHQgIHsgbmFtZTogXCJwbGF5ZXIxXCIsIGxvY2F0aW9uOiBbMTIsNV0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcIkhhbW1lciBCb3RcIiwgcHJpb3JpdHlWYWw6IDUwMCB9LFxuXHRcdFx0ICB7IG5hbWU6IFwicGxheWVyMlwiLCBsb2NhdGlvbjogWzExLDhdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJTcGluIEJvdFwiLCBwcmlvcml0eVZhbDogMjAwIH0sXG5cdFx0XHRdLFxuXG5cdFx0XHRbLy8gYm9hcmRtb3ZlMSxcblx0XHRcdFx0eyBuYW1lOiBcInBsYXllcjNcIiwgbG9jYXRpb246IFsxNSw0XSwgYmVhcmluZzogWy0xLCAwXSwgcm9ib3Q6IFwiVHdvbmt5XCIsIHByaW9yaXR5VmFsOiA4MDAgfSxcblx0XHRcdFx0eyBuYW1lOiBcInBsYXllcjFcIiwgbG9jYXRpb246IFsxMiw1XSwgYmVhcmluZzogWy0xLCAwXSwgcm9ib3Q6IFwiSGFtbWVyIEJvdFwiLCBwcmlvcml0eVZhbDogNTAwIH0sXG5cdFx0XHRcdHsgbmFtZTogXCJwbGF5ZXIyXCIsIGxvY2F0aW9uOiBbMTAsOF0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcIlNwaW4gQm90XCIsIHByaW9yaXR5VmFsOiAyMDAgfVxuXHRcdFx0XSxcblxuXHRcdFx0WyAvL2NhcmRtb3ZlMixcblx0XHRcdCAgeyBuYW1lOiBcInBsYXllcjNcIiwgbG9jYXRpb246IFsxNSw0XSwgYmVhcmluZzogWzAsIDFdLCByb2JvdDogXCJUd29ua3lcIiwgcHJpb3JpdHlWYWw6IDgwMCB9LFxuXHRcdFx0ICB7IG5hbWU6IFwicGxheWVyMVwiLCBsb2NhdGlvbjogWzEyLDVdLCBiZWFyaW5nOiBbMCwgLTFdLCByb2JvdDogXCJIYW1tZXIgQm90XCIsIHByaW9yaXR5VmFsOiA1MDAgfSxcblx0XHRcdCAgeyBuYW1lOiBcInBsYXllcjJcIiwgbG9jYXRpb246IFs4LDhdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJTcGluIEJvdFwiLCBwcmlvcml0eVZhbDogMjAwIH0sXG5cdFx0XHRdLFxuXG5cdFx0XHRbIC8vYm9hcmRtb3ZlMlxuXHRcdFx0XHR7IG5hbWU6IFwicGxheWVyM1wiLCBsb2NhdGlvbjogWzE1LDVdLCBiZWFyaW5nOiBbMCwgMV0sIHJvYm90OiBcIlR3b25reVwiLCBwcmlvcml0eVZhbDogODAwIH0sXG5cdFx0XHRcdHsgbmFtZTogXCJwbGF5ZXIxXCIsIGxvY2F0aW9uOiBbMTIsNV0sIGJlYXJpbmc6IFswLCAtMV0sIHJvYm90OiBcIkhhbW1lciBCb3RcIiwgcHJpb3JpdHlWYWw6IDUwMCB9LFxuXHRcdFx0XHR7IG5hbWU6IFwicGxheWVyMlwiLCBsb2NhdGlvbjogWzgsOF0sIGJlYXJpbmc6IFswLCAtMV0sIHJvYm90OiBcIlNwaW4gQm90XCIsIHByaW9yaXR5VmFsOiAyMDAgfVxuXHRcdFx0XSxcblx0XHRcdFsgLy9jYXJkbW92ZTMsXG5cdFx0XHQgIHsgbmFtZTogXCJwbGF5ZXIzXCIsIGxvY2F0aW9uOiBbMTUsM10sIGJlYXJpbmc6IFswLCAxXSwgcm9ib3Q6IFwiVHdvbmt5XCIsIHByaW9yaXR5VmFsOiA4MDAgfSxcblx0XHRcdCAgeyBuYW1lOiBcInBsYXllcjFcIiwgbG9jYXRpb246IFsxMiw1XSwgYmVhcmluZzogWy0xLCAwXSwgcm9ib3Q6IFwiSGFtbWVyIEJvdFwiLCBwcmlvcml0eVZhbDogNTAwIH0sXG5cdFx0XHQgIHsgbmFtZTogXCJwbGF5ZXIyXCIsIGxvY2F0aW9uOiBbOCw4XSwgYmVhcmluZzogWzAsIDFdLCByb2JvdDogXCJTcGluIEJvdFwiLCBwcmlvcml0eVZhbDogMjAwIH0sXG5cdFx0XHRdLFxuXG5cdFx0XHRbIC8vYm9hcmRtb3ZlM1xuXHRcdFx0XHR7IG5hbWU6IFwicGxheWVyM1wiLCBsb2NhdGlvbjogWzE1LDRdLCBiZWFyaW5nOiBbMCwgMV0sIHJvYm90OiBcIlR3b25reVwiLCBwcmlvcml0eVZhbDogODAwIH0sXG5cdFx0XHRcdHsgbmFtZTogXCJwbGF5ZXIxXCIsIGxvY2F0aW9uOiBbMTIsNV0sIGJlYXJpbmc6IFswLCAtMV0sIHJvYm90OiBcIkhhbW1lciBCb3RcIiwgcHJpb3JpdHlWYWw6IDUwMCB9LFxuXHRcdFx0XHR7IG5hbWU6IFwicGxheWVyMlwiLCBsb2NhdGlvbjogWzgsOF0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcIlNwaW4gQm90XCIsIHByaW9yaXR5VmFsOiAyMDAgfVxuXHRcdFx0XSxcblx0XHRcdFsgLy9jYXJkbW92ZTRcblx0XHRcdFx0eyBuYW1lOiBcInBsYXllcjNcIiwgbG9jYXRpb246IFsxNSw1XSwgYmVhcmluZzogWzAsIDFdLCByb2JvdDogXCJUd29ua3lcIiwgcHJpb3JpdHlWYWw6IDgwMCB9LFxuXHRcdFx0XHR7IG5hbWU6IFwicGxheWVyMVwiLCBsb2NhdGlvbjogWzEyLDVdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJIYW1tZXIgQm90XCIsIHByaW9yaXR5VmFsOiA1MDAgfSxcblx0XHRcdFx0eyBuYW1lOiBcInBsYXllcjJcIiwgbG9jYXRpb246IFs4LDldLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJTcGluIEJvdFwiLCBwcmlvcml0eVZhbDogMjAwIH1cblx0XHRcdF0sXG5cdFx0XHRbIC8vYm9hcmRtb3ZlNCxcblx0XHRcdCAgeyBuYW1lOiBcInBsYXllcjNcIiwgbG9jYXRpb246IFsxNSwzXSwgYmVhcmluZzogWzAsIDFdLCByb2JvdDogXCJUd29ua3lcIiwgcHJpb3JpdHlWYWw6IDgwMCB9LFxuXHRcdFx0ICB7IG5hbWU6IFwicGxheWVyMVwiLCBsb2NhdGlvbjogWzEyLDVdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJIYW1tZXIgQm90XCIsIHByaW9yaXR5VmFsOiA1MDAgfSxcblx0XHRcdCAgeyBuYW1lOiBcInBsYXllcjJcIiwgbG9jYXRpb246IFs4LDEwXSwgYmVhcmluZzogWy0xLCAwXSwgcm9ib3Q6IFwiU3BpbiBCb3RcIiwgcHJpb3JpdHlWYWw6IDIwMCB9LFxuXHRcdFx0XVxuXHRcdF1cblxuXHRcdFx0XHQvKiBiZWFyaW5nc1xuXG5cdFx0XHRcdFstMSwwXSBOXG5cdFx0XHRcdFswLCAxXSBFXG5cdFx0XHRcdFswLCAtMV0gV1xuXHRcdFx0XHRbMSwgMF0gU1xuXG5cdFx0XHRcdCovXG5cblx0XHR2YXIgcm9ib3RIYXNoID0ge307XG5cblx0XHQvLyB2YXIgZmxhdHRlbmVkUmVnaXN0ZXIgPSBfLmZsYXR0ZW4ob25lUmVnaXN0ZXIpXG5cblx0XHRmdW5jdGlvbiBkcmF3Um9ib3RzKGluaXRpYWwpIHtcblx0XHRcdGluaXRpYWwuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIsIGlkeCl7XG5cdFx0XHRcdGlmKHJvYm90SGFzaFtwbGF5ZXIubmFtZV0gPT09IHVuZGVmaW5lZCkgY3JlYXRlU3ByaXRlKCk7XG5cblx0XHRcdFx0ZnVuY3Rpb24gY3JlYXRlU3ByaXRlKCkge1xuXHRcdFx0XHRcdHZhciByb2JvdEltZyA9IHJvYm90SW1hZ2UocGxheWVyLnJvYm90KTtcblx0XHRcdFx0XHR2YXIgcm9ib3QgPSBuZXcgU3ByaXRlKFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2Uocm9ib3RJbWcpKVxuXHRcdFx0XHRcdHJvYm90LnBvc2l0aW9uLnggPSBpbWdTaXplKnBsYXllci5sb2NhdGlvblswXTtcblx0XHRcdCAgICAgICAgcm9ib3QucG9zaXRpb24ueSA9IGltZ1NpemUqcGxheWVyLmxvY2F0aW9uWzFdO1xuXHRcdFx0ICAgICAgICByb2JvdC5zY2FsZS5zZXQoMS9pbWdTY2FsZSwgMS9pbWdTY2FsZSk7XG5cblx0XHRcdCAgICAgIFx0c3RhZ2UuYWRkQ2hpbGQocm9ib3QpO1xuXHRcdFx0ICAgICAgXHRyb2JvdEhhc2hbcGxheWVyLm5hbWVdID0gcm9ib3Q7XG5cdFx0XHQgICAgICBcdHJvYm90SGFzaFtwbGF5ZXIubmFtZV0uYmVhcmluZyA9IHBsYXllci5iZWFyaW5nO1xuXHRcdFx0ICAgICAgXHRyZW5kZXJlci5yZW5kZXIoc3RhZ2UpXG5cdFx0XHRcdH1cdFxuXHRcdFx0fSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBydW5PbmVSZWdpc3RlciAocmVnaXN0ZXIpIHtcblx0XHRcdG1vdmUoXy5mbGF0dGVuKHJlZ2lzdGVyKSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyb2JvdEhhc2gpXG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIG1vdmUocGxheWVyT2Jqcykge1xuXHRcdFx0cmV0dXJuIHBsYXllck9ianMucmVkdWNlKGZ1bmN0aW9uKGFjYywgcGxheWVyLCBpZHgpe1xuXHRcdFx0XHR2YXIgcm9ib3QgPSByb2JvdEhhc2hbcGxheWVyLm5hbWVdO1xuXHRcdFx0XHR2YXIgdHVybiA9IGZhbHNlO1xuXHRcdFx0XHR2YXIgZGlyZWN0aW9uO1xuXG5cdFx0XHRcdHJldHVybiBhY2MudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHVybkFuZE1vdmUoKVx0XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGZ1bmN0aW9uIHR1cm5BbmRNb3ZlKCkge1xuXHRcdFx0XHRcdHJldHVybiB0dXJuUm9ib3QoKS50aGVuKGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gcHJvbWlzZUZvck1vdmVSb2JvdCgpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmdW5jdGlvbiB0dXJuUm9ib3QoKSB7XG5cdFx0XHRcdFx0aWYocGxheWVyLmJlYXJpbmdbMF0gIT09IHJvYm90LmJlYXJpbmdbMF0gJiYgcGxheWVyLmJlYXJpbmdbMV0gIT09IHJvYm90LmJlYXJpbmdbMV0pIHtcblx0XHRcdFx0XHRcdHZhciBkZWdyZWVzVG9Sb3RhdGUgPSBnZXRSb3RhdGlvbihyb2JvdC5iZWFyaW5nLCBwbGF5ZXIuYmVhcmluZyk7XG5cdFx0XHRcdFx0XHRyb2JvdC5iZWFyaW5nID0gcGxheWVyLmJlYXJpbmc7XG5cdFx0XHRcdFx0XHR2YXIgZGlyZWN0aW9uOyAvL2Nsb2Nrd2lzZSBvciBjb3VudGVyY2xvY2t3aXNlXG5cblx0XHRcdFx0XHRcdHZhciBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKCk7XG5cdFx0XHRcdFx0XHRjb250YWluZXIucG9zaXRpb24ueCA9IHJvYm90LnBvc2l0aW9uLnggKyBpbWdTaXplLzJcblx0XHRcdFx0XHRcdGNvbnRhaW5lci5wb3NpdGlvbi55ID0gcm9ib3QucG9zaXRpb24ueSArIGltZ1NpemUvMlxuXHRcdFx0XHRcdFx0Y29udGFpbmVyLnBpdm90LnNldChyb2JvdC5wb3NpdGlvbi54ICsgaW1nU2l6ZS8yLCByb2JvdC5wb3NpdGlvbi55ICsgaW1nU2l6ZS8yKVxuXHRcdFx0XHRcdFx0Y29udGFpbmVyLmFkZENoaWxkKHJvYm90KTtcblx0XHRcdFx0XHRcdHN0YWdlLmFkZENoaWxkKGNvbnRhaW5lcik7XG5cdFx0XHRcdFx0XHR0dXJuID0gdHJ1ZTtcblx0XHRcdFx0XHRcdHJldHVybiBwcm9taXNlRm9yUm90YXRlKCk7XG5cblx0XHRcdFx0XHRcdGZ1bmN0aW9uIHJvdGF0ZShyZXNvbHZlKSB7XG5cdFx0XHRcdFx0XHRcdGlmKHJvYm90LnJvdGF0aW9uIDw9IGRlZ3JlZXNUb1JvdGF0ZSAmJiBkaXJlY3Rpb24gPT0gXCJjbG9ja3dpc2VcIiB8fCBkaXJlY3Rpb24gPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0ZGlyZWN0aW9uID0gXCJjbG9ja3dpc2VcIjtcblx0XHRcdFx0XHRcdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUocm90YXRlLmJpbmQobnVsbCwgcmVzb2x2ZSkpO1xuXHRcdFx0XHRcdFx0XHRcdHJvYm90LnJvdGF0aW9uICs9IDAuMVx0XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZihyb2JvdC5yb3RhdGlvbiA+PSBkZWdyZWVzVG9Sb3RhdGUpIHtcblx0XHRcdFx0XHRcdFx0XHRkaXJlY3Rpb24gPSBcImNvdW50ZXJjbG9ja3dpc2VcIjtcblx0XHRcdFx0XHRcdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUocm90YXRlLmJpbmQobnVsbCwgcmVzb2x2ZSkpO1xuXHRcdFx0XHRcdFx0XHRcdHJvYm90LnJvdGF0aW9uIC09IDAuMTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24gcHJvbWlzZUZvclJvdGF0ZSAoKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAkcShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuXHRcdFx0XHRcdFx0XHRcdHJvdGF0ZShyZXNvbHZlKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVzb2x2ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIG1vdmVSb2JvdChyZXNvbHZlKSB7XG5cdFx0XHRcdFx0aWYoIXR1cm4gJiYgcm9ib3QucG9zaXRpb24ueCA+PSBpbWdTaXplICogcGxheWVyLmxvY2F0aW9uWzBdICYmIGRpcmVjdGlvbiA9PSAnbm9ydGgnIHx8IGRpcmVjdGlvbiA9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGRpcmVjdGlvbiA9ICdub3J0aCc7XG5cdFx0XHRcdCAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmVSb2JvdC5iaW5kKG51bGwsIHJlc29sdmUpKTtcblx0XHRcdFx0ICAgICAgICByb2JvdC5wb3NpdGlvbi54IC09IDE7XG5cdFx0XHRcdCAgXHR9IFxuXHRcdFx0XHQgIFx0ZWxzZSBpZighdHVybiAmJiByb2JvdC5wb3NpdGlvbi54IDw9IGltZ1NpemUgKiBwbGF5ZXIubG9jYXRpb25bMF0pIHtcblx0XHRcdFx0ICBcdFx0ZGlyZWN0aW9uID0gXCJzb3V0aFwiO1xuXHRcdFx0XHQgIFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZVJvYm90LmJpbmQobnVsbCwgcmVzb2x2ZSkpO1xuXHRcdFx0XHQgIFx0XHRyb2JvdC5wb3NpdGlvbi54ICs9IDE7XG5cdFx0XHRcdCAgXHR9XG5cdFx0XHRcdCAgXHRlbHNlIGlmKCF0dXJuICYmIHJvYm90LnBvc2l0aW9uLnkgPD0gaW1nU2l6ZSAqIHBsYXllci5sb2NhdGlvblsxXSkge1xuXHRcdFx0XHQgIFx0XHRkaXJlY3Rpb24gPSBcIndlc3RcIjtcblx0XHRcdFx0ICBcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmVSb2JvdC5iaW5kKG51bGwsIHJlc29sdmUpKTtcblx0XHRcdFx0ICBcdFx0cm9ib3QucG9zaXRpb24ueSArPSAxO1xuXHRcdFx0XHQgIFx0fSBcdFx0XG5cdFx0XHRcdCAgXHRlbHNlIGlmKCF0dXJuICYmIHJvYm90LnBvc2l0aW9uLnkgPj0gaW1nU2l6ZSAmIHBsYXllci5sb2NhdGlvblsxXSAmJiBkaXJlY3Rpb24gPT0gJ2Vhc3QnKSB7XG5cdFx0XHRcdCAgXHRcdGRpcmVjdGlvbiA9ICdlYXN0Jztcblx0XHRcdFx0ICBcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmVSb2JvdC5iaW5kKG51bGwsIHJlc29sdmUpKTtcblx0XHRcdFx0ICBcdFx0cm9ib3QucG9zaXRpb24ueSAtPSAxO1xuXHRcdFx0XHQgIFx0fSBlbHNlIHtcblx0XHRcdFx0ICBcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHQgIFx0fSBcdFxuXHRcdFx0XHR9XHRcblx0XHRcdFx0ZnVuY3Rpb24gcHJvbWlzZUZvck1vdmVSb2JvdCgpe1xuXHRcdFx0XHRcdHJldHVybiAkcShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuXHRcdFx0XHRcdFx0bW92ZVJvYm90KHJlc29sdmUpO1x0XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0fSwgJHEucmVzb2x2ZSgpKVxuXHRcdH1cblxuXHRcdC8vIGZ1bmN0aW9uIHByb21pc2VGb3JNb3ZpbmcgKG9uZU1vdmUpIHtcblx0XHQvLyBcdHJldHVybiAkcShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHQvLyBcdFx0bW92ZShvbmVNb3ZlKTtcblx0XHQvLyBcdH0pO1xuXHRcdC8vIH1cblxuXG5cblxuXHRcdGJ1aWxkVGlsZXMoKTtcblx0XHRkcmF3RG9ja3MoKTtcblx0XHRkcmF3RG9ja0xpbmUoKTtcblx0XHRkcmF3TGFzZXJzKCk7XG5cdFx0ZHJhd1JvYm90cyhwbGF5ZXJzKTtcblx0XHRydW5PbmVSZWdpc3RlcihvbmVSZWdpc3Rlcilcblx0XHQvLyBjb25zb2xlLmxvZygncm9ibyBoYXNoJywgcm9ib3RIYXNoKVxuXG5cdFx0ZnVuY3Rpb24gYnVpbGRNYXAoKXtcblx0XHQgIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XG5cdFx0ICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYnVpbGRNYXApO1xuXHRcdH1cblx0XHRpZigkc2NvcGUuZ2FtZSkge1xuXG5cdFx0XHRidWlsZE1hcCgpO1xuXHRcdH1cblx0fVxuXG5cbn0pO1xuXG5mdW5jdGlvbiByb2JvdEltYWdlIChyb2JvdE5hbWUpIHtcblx0cmV0dXJuICcvaW1nL3JvYm90cy8nICsgcm9ib3ROYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvIC9nLCcnKSArICdBcnJvdy5wbmcnO1xufVxuXG5mdW5jdGlvbiBnZXRSb3RhdGlvbiAob3JpZywgbmV4dCl7XG5cdGlmKG9yaWdbMF0gKyBuZXh0WzBdID09PSAgMCB8fCBvcmlnWzFdICsgbmV4dFsxXSA9PT0gMCkgcmV0dXJuIE1hdGguUEk7XG5cdGVsc2Uge1xuXHQgIHZhciBkb3QgPSAtb3JpZ1swXSpuZXh0WzFdICsgb3JpZ1sxXSpuZXh0WzBdO1xuXHQgIHZhciByYWQgPSBNYXRoLmFzaW4oZG90KTtcbiAgXHRyZXR1cm4gcmFkO1xuXHR9XG59XG5cbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcbiAgICAgIHVybDogJy9nYW1lLzpnYW1lSWQnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvanMvZ2FtZS9nYW1lLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0dhbWVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdGhlR2FtZTogZnVuY3Rpb24oR2FtZUZhY3RvcnksICRzdGF0ZVBhcmFtcykge1xuICAgICAgICAgIHJldHVybiBHYW1lRmFjdG9yeS5nZXRHYW1lKCRzdGF0ZVBhcmFtcy5nYW1lSWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS9ob21lLmh0bWwnXG4gICAgfSk7XG59KTsiLCJhcHAuY29udHJvbGxlcihcIkxvYmJ5Q29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsIEZpcmViYXNlRmFjdG9yeSkge1xuXG5cdHZhciB0ZXN0a2V5ID0gJzEyMzQnXG5cblx0JHNjb3BlLmxvY2FsQ29ubmVjdGlvbiA9IEZpcmViYXNlRmFjdG9yeS5nZXRDb25uZWN0aW9uKHRlc3RrZXkgKyAnL2dhbWUnKVxuXG5cdCRzY29wZS5nYW1lcyA9IFtcImdhbWUxXCIsIFwiZ2FtZTJcIiwgXCJnYW1lM1wiLCBcImdhbWU0XCJdXG5cblx0JHNjb3BlLmluZm8gPSBbJ2dhbWUxIGluZm8nLCAnZ2FtZTIgaW5mbycsICdnYW1lMyBpbmZvJywgJ2dhbWU0IGluZm8nXVxuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpe1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9iYnknLCB7XG5cdFx0dXJsOiAnL2xvYmJ5Jyxcblx0XHRjb250cm9sbGVyOiAnTG9iYnlDb250cm9sbGVyJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2xvYmJ5L2xvYmJ5Lmh0bWwnXG5cdH0pXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgJHNjb3BlLmxvZ2luID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICRzY29wZS5zZW5kTG9naW4gPSBmdW5jdGlvbiAobG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICAgICBBdXRoU2VydmljZS5sb2dpbihsb2dpbkluZm8pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXG4gICAgICAgIHRlbXBsYXRlOiAnPGltZyBuZy1yZXBlYXQ9XCJpdGVtIGluIHN0YXNoXCIgd2lkdGg9XCIzMDBcIiBuZy1zcmM9XCJ7eyBpdGVtIH19XCIgLz4nLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGFzaCA9IHN0YXNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGF0YS5hdXRoZW50aWNhdGUgaXMgcmVhZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnU2VjcmV0U3Rhc2gnLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3NlY3JldC1zdGFzaCcpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0YXNoOiBnZXRTdGFzaFxuICAgIH07XG5cbn0pOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpO1xuIiwiYXBwLmZhY3RvcnkoJ0JvYXJkRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblx0cmV0dXJuIHtcblx0XHRnZXRCb2FyZDogZnVuY3Rpb24oYm9hcmRJZCkge1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9ib2FyZC8nICsgYm9hcmRJZClcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmRhdGEpXG5cdFx0fVxuXHR9XG59KSIsImFwcC5mYWN0b3J5KCdGaXJlYmFzZUZhY3RvcnknLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QpIHtcblxuXHR2YXIgRmlyZWJhc2VGYWN0b3J5ID0ge307XG5cblx0dmFyIGJhc2VVcmwgPSBcImh0dHBzOi8vcmVzcGxlbmRlbnQtdG9yY2gtNDMyMi5maXJlYmFzZWlvLmNvbS9cIjtcblxuXHRGaXJlYmFzZUZhY3RvcnkuZ2V0Q29ubmVjdGlvbiA9IGZ1bmN0aW9uKGtleSkge1xuXHRcdHZhciBsb2NhbENvbm5lY3Rpb24gPSAkZmlyZWJhc2VPYmplY3QobmV3IEZpcmViYXNlKGJhc2VVcmwgKyBrZXkpKVxuXHRcdHJldHVybiBsb2NhbENvbm5lY3Rpb25cblx0fVxuXG5cdHJldHVybiBGaXJlYmFzZUZhY3RvcnlcblxufSkiLCJhcHAuZmFjdG9yeSgnRnVsbHN0YWNrUGljcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0UtVDc1bFdBQUFtcXFKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0V2WkFnLVZBQUFrOTMyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VnTk1lT1hJQUlmRGhLLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VReUlETldnQUF1NjBCLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0NGM1Q1UVc4QUUybEdKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FlVnc1U1dvQUFBTHNqLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FhSklQN1VrQUFsSUdzLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FRT3c5bFdFQUFZOUZsLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1PUWJWckNNQUFOd0lNLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjliX2Vyd0NZQUF3UmNKLnBuZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjVQVGR2bkNjQUVBbDR4LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjRxd0MwaUNZQUFsUEdoLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjJiMzN2UklVQUE5bzFELmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQndwSXdyMUlVQUF2TzJfLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQnNTc2VBTkNZQUVPaEx3LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0o0dkxmdVV3QUFkYTRMLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0k3d3pqRVZFQUFPUHBTLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lkSHZUMlVzQUFubkhWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0dDaVBfWVdZQUFvNzVWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lTNEpQSVdJQUkzN3F1LmpwZzpsYXJnZSdcbiAgICBdO1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnR2FtZUZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG5cdFxuXHR2YXIgR2FtZUZhY3RvcnkgPSB7fTtcblxuXHRHYW1lRmFjdG9yeS5nZXRHYW1lID0gZnVuY3Rpb24oZ2FtZUlkKXtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2dhbWUvJyArIGdhbWVJZClcblx0XHQudGhlbihmdW5jdGlvbihyZXMpe1xuXHRcdCAgXHRyZXR1cm4gcmVzLmRhdGE7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gR2FtZUZhY3Rvcnk7XG59KSIsImFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxuICAgICAgICAnQXQgbG9uZyBsYXN0LCBJIGxpdmUhJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciBwcm9qZWN0LCBleGNlcHQgdGhhdCBJIGFtIHlvdXJzLiA6KScsXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJyxcbiAgICAgICAgJ+OBk+OCk+OBq+OBoeOBr+OAgeODpuODvOOCtuODvOanmOOAgicsXG4gICAgICAgICdXZWxjb21lLiBUby4gV0VCU0lURS4nLFxuICAgICAgICAnOkQnLFxuICAgICAgICAnWWVzLCBJIHRoaW5rIHdlXFwndmUgbWV0IGJlZm9yZS4nLFxuICAgICAgICAnR2ltbWUgMyBtaW5zLi4uIEkganVzdCBncmFiYmVkIHRoaXMgcmVhbGx5IGRvcGUgZnJpdHRhdGEnLFxuICAgICAgICAnSWYgQ29vcGVyIGNvdWxkIG9mZmVyIG9ubHkgb25lIHBpZWNlIG9mIGFkdmljZSwgaXQgd291bGQgYmUgdG8gbmV2U1FVSVJSRUwhJyxcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXG4gICAgICAgIGdldFJhbmRvbUdyZWV0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTtcbiIsImFwcC5kaXJlY3RpdmUoJ2N0cmxwYW5lbCcsIGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2dhbWUvY3RybFBhbmVsL2N0cmxwYW5lbC5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgXHRnYW1lOiAnPSdcbiAgICAgICAgfVxuICAgIH1cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ2Z1bGxzdGFja0xvZ28nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5odG1sJ1xuICAgIH07XG59KTsiLCJhcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIEFVVEhfRVZFTlRTLCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0hvbWUnLCBzdGF0ZTogJ2hvbWUnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0Fib3V0Jywgc3RhdGU6ICdsb2JieScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnRG9jdW1lbnRhdGlvbicsIHN0YXRlOiAnZG9jcycgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnTWVtYmVycyBPbmx5Jywgc3RhdGU6ICdtZW1iZXJzT25seScsIGF1dGg6IHRydWUgfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
