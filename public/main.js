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

app.config(function ($stateProvider) {
    $stateProvider.state('docs', {
        url: '/docs',
        templateUrl: 'js/docs/docs.html'
    });
});

// window.start = function(){
//   console.log('window.start')
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
//   console.log('createBoardArr');
//   for(var key in board) {
//     if(key.slice(0,3) === 'col') boardArr.push(board[key])
//   }
//   return boardArr;
// }

// function drawDockLine() {
//   console.log('drawDockLine');
//   var line = new PIXI.Graphics;
//   line.lineStyle(4, 0x000000, 1);
//   line.moveTo(12*imgSizeActual/imgScale, 0)
//   line.lineTo(12*imgSizeActual/imgScale, 12*imgSizeActual/imgScale)

//   stage.addChild(line)
// }

// function buildTiles() {
//   console.log('buildTiles');
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
//   console.log('buildMap', board);
//   createBoardArr();
//   buildTiles();
//   drawDockLine();
// }

// function init(){
//   console.log('init', renderer.view)
//   renderer.render(stage);
// }

// buildMap();

app.controller('GameCtrl', function ($scope, $state, theGame) {

    // window.start()
    $scope.game = theGame;
    $scope.boardObj = $scope.game.board;

    function collectOneCol(n) {
        var key = 'col' + n.toString();
        var idents = $scope.boardObj[key].map(function (tile) {
            return tile.identifier;
        });
        return idents;
    }

    $scope.board = [];
    for (var i = 11; i >= 0; i--) {
        $scope.board.push(collectOneCol(i));
    }
});

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

app.directive('board', function ($parse) {
    return {
        template: '<table><tr ng-repeat="col in board"><td ng-repeat="tile in col track by $index"><img src="/img/tiles/{{tile}}.jpg"></td></tr></table>',
        restrict: 'E',
        scope: { board: '=' },
        controller: function postLink($scope, $element, $attrs) {
            var stage = new PIXI.Stage(0x66ff99);
            var renderer = new PIXI.CanvasRenderer(640, 480);
            $scope.renderPlz = function () {
                console.log('renderPlz');
                renderer.render(stage);
            };
        },
        link: function link(scope) {
            console.log('link');
            scope.renderPlz();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJkb2NzL2RvY3MuanMiLCJnYW1lL2dhbWUuY29udHJvbGxlci5qcyIsImdhbWUvZ2FtZS5zdGF0ZS5qcyIsImhvbWUvaG9tZS5qcyIsImxvYmJ5L2xvYmJ5LmNvbnRyb2xsZXIuanMiLCJsb2JieS9sb2JieS5zdGF0ZS5qcyIsImxvZ2luL2xvZ2luLmpzIiwibWVtYmVycy1vbmx5L21lbWJlcnMtb25seS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvQm9hcmRGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GaXJlYmFzZUZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL0Z1bGxzdGFja1BpY3MuanMiLCJjb21tb24vZmFjdG9yaWVzL0dhbWVGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJnYW1lL2JvYXJkL2JvYXJkLmRpcmVjdGl2ZS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUE7O0FBRUEscUJBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7OztBQUdBLEdBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7O0FBR0EsUUFBQSw0QkFBQSxHQUFBLFNBQUEsNEJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUE7S0FDQSxDQUFBOzs7O0FBSUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7O0FBRUEsWUFBQSxDQUFBLDRCQUFBLENBQUEsT0FBQSxDQUFBLEVBQUE7OztBQUdBLG1CQUFBO1NBQ0E7O0FBRUEsWUFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7OztBQUdBLG1CQUFBO1NBQ0E7OztBQUdBLGFBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7OztBQUlBLGdCQUFBLElBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7YUFDQSxNQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7YUFDQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUNsREEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7O0FBR0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLGlCQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBOzs7QUFHQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNoQkEsQ0FBQSxZQUFBOztBQUVBLGdCQUFBLENBQUE7OztBQUdBLFFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBOztBQUVBLFFBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOzs7OztBQUtBLE9BQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0Esb0JBQUEsRUFBQSxvQkFBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7QUFDQSxxQkFBQSxFQUFBLHFCQUFBO0FBQ0Esc0JBQUEsRUFBQSxzQkFBQTtBQUNBLHdCQUFBLEVBQUEsd0JBQUE7QUFDQSxxQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxFQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsWUFBQSxVQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQSxDQUFBLGdCQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxhQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7QUFDQSx5QkFBQSxFQUFBLHVCQUFBLFFBQUEsRUFBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxhQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxXQUFBLEVBQ0EsVUFBQSxTQUFBLEVBQUE7QUFDQSxtQkFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtTQUNBLENBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQTs7QUFFQSxpQkFBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0E7Ozs7QUFJQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTs7Ozs7Ozs7OztBQVVBLGdCQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsSUFBQSxVQUFBLEtBQUEsSUFBQSxFQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7YUFDQTs7Ozs7QUFLQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsV0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsV0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7S0FFQSxDQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFlBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLEVBQUEsQ0FBQTs7QUNwSUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxPQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0xBLEdBQUEsQ0FBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUE7OztBQUdBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTs7QUFFQSxhQUFBLGFBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxZQUFBLEdBQUEsR0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsVUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxNQUFBLENBQUE7S0FDQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0NBR0EsQ0FBQSxDQUFBOztBQ3BCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxlQUFBO0FBQ0EsbUJBQUEsRUFBQSxvQkFBQTtBQUNBLGtCQUFBLEVBQUEsVUFBQTtBQUNBLGVBQUEsRUFBQTtBQUNBLG1CQUFBLEVBQUEsaUJBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQTtBQUNBLHVCQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDWkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMQSxHQUFBLENBQUEsVUFBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsZUFBQSxFQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsZUFBQSxHQUFBLGVBQUEsQ0FBQSxhQUFBLENBQUEsT0FBQSxHQUFBLE9BQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsWUFBQSxFQUFBLFlBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNWQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLGlCQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ05BLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0FBQ0Esa0JBQUEsRUFBQSxXQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLFNBQUEsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLEdBQUEsNEJBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMzQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsZUFBQTtBQUNBLGdCQUFBLEVBQUEsbUVBQUE7QUFDQSxrQkFBQSxFQUFBLG9CQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSx1QkFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBOzs7QUFHQSxZQUFBLEVBQUE7QUFDQSx3QkFBQSxFQUFBLElBQUE7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxTQUFBLFFBQUEsR0FBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsUUFBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMvQkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxrQkFBQSxPQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsR0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBO3VCQUFBLFFBQUEsQ0FBQSxJQUFBO2FBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDUEEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsZUFBQSxFQUFBOztBQUVBLFFBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLE9BQUEsR0FBQSxnREFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsYUFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxlQUFBLEdBQUEsZUFBQSxDQUFBLElBQUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxlQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUEsZUFBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDYkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUEsQ0FDQSx1REFBQSxFQUNBLHFIQUFBLEVBQ0EsaURBQUEsRUFDQSxpREFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLENBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUM3QkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxXQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLGVBQUEsQ0FBQSxPQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxHQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG1CQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUEsV0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDWkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxpQkFBQSxFQUFBLFlBQUE7O0FBRUEsUUFBQSxrQkFBQSxHQUFBLFNBQUEsa0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsUUFBQSxTQUFBLEdBQUEsQ0FDQSxlQUFBLEVBQ0EsdUJBQUEsRUFDQSxzQkFBQSxFQUNBLHVCQUFBLEVBQ0EseURBQUEsRUFDQSwwQ0FBQSxFQUNBLGNBQUEsRUFDQSx1QkFBQSxFQUNBLElBQUEsRUFDQSxpQ0FBQSxFQUNBLDBEQUFBLEVBQ0EsNkVBQUEsQ0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLFNBQUE7QUFDQSx5QkFBQSxFQUFBLDZCQUFBO0FBQ0EsbUJBQUEsa0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUM1QkEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSx1SUFBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxrQkFBQSxFQUFBLFNBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ0EsZ0JBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLFFBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7YUFDQSxDQUFBO1NBRUE7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLGlCQUFBLENBQUEsU0FBQSxFQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDbkJBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLHlDQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBOztBQUVBLGlCQUFBLENBQUEsS0FBQSxHQUFBLENBQ0EsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsY0FBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSwyQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsMEJBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSwyQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLHlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsbUJBQUEsRUFBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtTQUVBOztLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZScsICdmaXJlYmFzZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgICAgdXJsOiAnL2Fib3V0JyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0Q29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYWJvdXQvYWJvdXQuaHRtbCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBYm91dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBGdWxsc3RhY2tQaWNzKSB7XG5cbiAgICAvLyBJbWFnZXMgb2YgYmVhdXRpZnVsIEZ1bGxzdGFjayBwZW9wbGUuXG4gICAgJHNjb3BlLmltYWdlcyA9IF8uc2h1ZmZsZShGdWxsc3RhY2tQaWNzKTtcblxufSk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ1NvY2tldCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbiAoJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbiAoZnJvbVNlcnZlcikge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcbiAgICAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb2NzJywge1xuICAgICAgICB1cmw6ICcvZG9jcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG9jcy9kb2NzLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsImFwcC5jb250cm9sbGVyKCdHYW1lQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCB0aGVHYW1lKXtcblxuXHQvLyB3aW5kb3cuc3RhcnQoKVxuICAkc2NvcGUuZ2FtZSA9IHRoZUdhbWU7XG4gICRzY29wZS5ib2FyZE9iaiA9ICRzY29wZS5nYW1lLmJvYXJkXG5cbiAgZnVuY3Rpb24gY29sbGVjdE9uZUNvbChuKXtcbiAgICB2YXIga2V5ID0gJ2NvbCcgKyBuLnRvU3RyaW5nKCk7XG4gICAgdmFyIGlkZW50cyA9ICRzY29wZS5ib2FyZE9ialtrZXldLm1hcChmdW5jdGlvbih0aWxlKXtcbiAgICAgIHJldHVybiB0aWxlLmlkZW50aWZpZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuIGlkZW50cztcbiAgfVxuXG4gICRzY29wZS5ib2FyZCA9IFtdO1xuICBmb3IodmFyIGkgPSAxMTsgaSA+PSAwOyBpIC0tKXtcbiAgICAkc2NvcGUuYm9hcmQucHVzaChjb2xsZWN0T25lQ29sKGkpKTtcbiAgfVxuXG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lJywge1xuICAgICAgdXJsOiAnL2dhbWUvOmdhbWVJZCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9qcy9nYW1lL2dhbWUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnR2FtZUN0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0aGVHYW1lOiBmdW5jdGlvbihHYW1lRmFjdG9yeSwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgcmV0dXJuIEdhbWVGYWN0b3J5LmdldEdhbWUoJHN0YXRlUGFyYW1zLmdhbWVJZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL2hvbWUuaHRtbCdcbiAgICB9KTtcbn0pOyIsImFwcC5jb250cm9sbGVyKFwiTG9iYnlDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRzY29wZSwgRmlyZWJhc2VGYWN0b3J5KSB7XG5cblx0dmFyIHRlc3RrZXkgPSAnMTIzNCdcblxuXHQkc2NvcGUubG9jYWxDb25uZWN0aW9uID0gRmlyZWJhc2VGYWN0b3J5LmdldENvbm5lY3Rpb24odGVzdGtleSArICcvZ2FtZScpXG5cblx0JHNjb3BlLmdhbWVzID0gW1wiZ2FtZTFcIiwgXCJnYW1lMlwiLCBcImdhbWUzXCIsIFwiZ2FtZTRcIl1cblxuXHQkc2NvcGUuaW5mbyA9IFsnZ2FtZTEgaW5mbycsICdnYW1lMiBpbmZvJywgJ2dhbWUzIGluZm8nLCAnZ2FtZTQgaW5mbyddXG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2JieScsIHtcblx0XHR1cmw6ICcvbG9iYnknLFxuXHRcdGNvbnRyb2xsZXI6ICdMb2JieUNvbnRyb2xsZXInLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvbG9iYnkvbG9iYnkuaHRtbCdcblx0fSlcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgJHNjb3BlLnNlbmRMb2dpbiA9IGZ1bmN0aW9uIChsb2dpbkluZm8pIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luSW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ21lbWJlcnNPbmx5Jywge1xuICAgICAgICB1cmw6ICcvbWVtYmVycy1hcmVhJyxcbiAgICAgICAgdGVtcGxhdGU6ICc8aW1nIG5nLXJlcGVhdD1cIml0ZW0gaW4gc3Rhc2hcIiB3aWR0aD1cIjMwMFwiIG5nLXNyYz1cInt7IGl0ZW0gfX1cIiAvPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsIFNlY3JldFN0YXNoKSB7XG4gICAgICAgICAgICBTZWNyZXRTdGFzaC5nZXRTdGFzaCgpLnRoZW4oZnVuY3Rpb24gKHN0YXNoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXNoID0gc3Rhc2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBkYXRhLmF1dGhlbnRpY2F0ZSBpcyByZWFkIGJ5IGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIC8vIHRoYXQgY29udHJvbHMgYWNjZXNzIHRvIHRoaXMgc3RhdGUuIFJlZmVyIHRvIGFwcC5qcy5cbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdTZWNyZXRTdGFzaCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgdmFyIGdldFN0YXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvc2VjcmV0LXN0YXNoJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3Rhc2g6IGdldFN0YXNoXG4gICAgfTtcblxufSk7IiwiYXBwLmZhY3RvcnkoJ0JvYXJkRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblx0cmV0dXJuIHtcblx0XHRnZXRCb2FyZDogZnVuY3Rpb24oYm9hcmRJZCkge1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9ib2FyZC8nICsgYm9hcmRJZClcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmRhdGEpXG5cdFx0fVxuXHR9XG59KSIsImFwcC5mYWN0b3J5KCdGaXJlYmFzZUZhY3RvcnknLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QpIHtcblxuXHR2YXIgRmlyZWJhc2VGYWN0b3J5ID0ge307XG5cblx0dmFyIGJhc2VVcmwgPSBcImh0dHBzOi8vcmVzcGxlbmRlbnQtdG9yY2gtNDMyMi5maXJlYmFzZWlvLmNvbS9cIjtcblxuXHRGaXJlYmFzZUZhY3RvcnkuZ2V0Q29ubmVjdGlvbiA9IGZ1bmN0aW9uKGtleSkge1xuXHRcdHZhciBsb2NhbENvbm5lY3Rpb24gPSAkZmlyZWJhc2VPYmplY3QobmV3IEZpcmViYXNlKGJhc2VVcmwgKyBrZXkpKVxuXHRcdHJldHVybiBsb2NhbENvbm5lY3Rpb25cblx0fVxuXG5cdHJldHVybiBGaXJlYmFzZUZhY3RvcnlcblxufSkiLCJhcHAuZmFjdG9yeSgnRnVsbHN0YWNrUGljcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0UtVDc1bFdBQUFtcXFKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0V2WkFnLVZBQUFrOTMyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VnTk1lT1hJQUlmRGhLLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VReUlETldnQUF1NjBCLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0NGM1Q1UVc4QUUybEdKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FlVnc1U1dvQUFBTHNqLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FhSklQN1VrQUFsSUdzLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FRT3c5bFdFQUFZOUZsLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1PUWJWckNNQUFOd0lNLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjliX2Vyd0NZQUF3UmNKLnBuZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjVQVGR2bkNjQUVBbDR4LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjRxd0MwaUNZQUFsUEdoLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjJiMzN2UklVQUE5bzFELmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQndwSXdyMUlVQUF2TzJfLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQnNTc2VBTkNZQUVPaEx3LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0o0dkxmdVV3QUFkYTRMLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0k3d3pqRVZFQUFPUHBTLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lkSHZUMlVzQUFubkhWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0dDaVBfWVdZQUFvNzVWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lTNEpQSVdJQUkzN3F1LmpwZzpsYXJnZSdcbiAgICBdO1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnR2FtZUZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG5cdFxuXHR2YXIgR2FtZUZhY3RvcnkgPSB7fTtcblxuXHRHYW1lRmFjdG9yeS5nZXRHYW1lID0gZnVuY3Rpb24oZ2FtZUlkKXtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2dhbWUvJyArIGdhbWVJZClcblx0XHQudGhlbihmdW5jdGlvbihyZXMpe1xuXHRcdCAgXHRyZXR1cm4gcmVzLmRhdGE7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gR2FtZUZhY3Rvcnk7XG59KSIsImFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxuICAgICAgICAnQXQgbG9uZyBsYXN0LCBJIGxpdmUhJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciBwcm9qZWN0LCBleGNlcHQgdGhhdCBJIGFtIHlvdXJzLiA6KScsXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJyxcbiAgICAgICAgJ+OBk+OCk+OBq+OBoeOBr+OAgeODpuODvOOCtuODvOanmOOAgicsXG4gICAgICAgICdXZWxjb21lLiBUby4gV0VCU0lURS4nLFxuICAgICAgICAnOkQnLFxuICAgICAgICAnWWVzLCBJIHRoaW5rIHdlXFwndmUgbWV0IGJlZm9yZS4nLFxuICAgICAgICAnR2ltbWUgMyBtaW5zLi4uIEkganVzdCBncmFiYmVkIHRoaXMgcmVhbGx5IGRvcGUgZnJpdHRhdGEnLFxuICAgICAgICAnSWYgQ29vcGVyIGNvdWxkIG9mZmVyIG9ubHkgb25lIHBpZWNlIG9mIGFkdmljZSwgaXQgd291bGQgYmUgdG8gbmV2U1FVSVJSRUwhJyxcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXG4gICAgICAgIGdldFJhbmRvbUdyZWV0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTtcbiIsImFwcC5kaXJlY3RpdmUoJ2JvYXJkJywgZnVuY3Rpb24gKCRwYXJzZSkge1xuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlOiAnPHRhYmxlPjx0ciBuZy1yZXBlYXQ9XCJjb2wgaW4gYm9hcmRcIj48dGQgbmctcmVwZWF0PVwidGlsZSBpbiBjb2wgdHJhY2sgYnkgJGluZGV4XCI+PGltZyBzcmM9XCIvaW1nL3RpbGVzL3t7dGlsZX19LmpwZ1wiPjwvdGQ+PC90cj48L3RhYmxlPicsXG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICBzY29wZToge2JvYXJkOiAnPSd9LFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIHBvc3RMaW5rKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xuICAgICAgdmFyIHN0YWdlID0gbmV3IFBJWEkuU3RhZ2UoMHg2NmZmOTkpO1xuICAgICAgdmFyIHJlbmRlcmVyID0gbmV3IFBJWEkuQ2FudmFzUmVuZGVyZXIoNjQwLDQ4MCk7XG4gICAgICAkc2NvcGUucmVuZGVyUGx6ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgY29uc29sZS5sb2coJ3JlbmRlclBseicpXG4gICAgICAgIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XG4gICAgICB9XG5cbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlKXtcbiAgICAgIGNvbnNvbGUubG9nKCdsaW5rJylcbiAgICAgIHNjb3BlLnJlbmRlclBseigpXG4gICAgfVxuICB9O1xufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCdcbiAgICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdIb21lJywgc3RhdGU6ICdob21lJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdBYm91dCcsIHN0YXRlOiAnbG9iYnknIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0RvY3VtZW50YXRpb24nLCBzdGF0ZTogJ2RvY3MnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ01lbWJlcnMgT25seScsIHN0YXRlOiAnbWVtYmVyc09ubHknLCBhdXRoOiB0cnVlIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
