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
app.controller("CreateGameController", function ($scope, boards, GameFactory, $state) {

    $scope.boards = boards;

    $scope.robots = [{ name: "Spin Bot", imgUrl: "/img/robots/spinbot.jpg" }, { name: "Twonky", imgUrl: "/img/robots/twonky.jpg" }, { name: "Zoom Bot", imgUrl: "/img/robots/zoombot.jpg" }];

    $scope.CreateGame = function (game) {
        return GameFactory.createPlayerAndGame(game).then(function (gameInfo) {
            console.log('this is the response', gameInfo);
            $state.go('waitingroom', { id: gameInfo._id });
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
});
app.config(function ($stateProvider) {
    $stateProvider.state('docs', {
        url: '/docs',
        templateUrl: 'js/docs/docs.html'
    });
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

window.start = function () {
    document.getElementById("board").appendChild(renderer.view);
};

var stage = new PIXI.Stage(0x66ff99);
var renderer = new PIXI.CanvasRenderer(640, 480);

//all image files are 150px. Do not change this number!
var imgSizeActual = 150;

//factor to rescale images by. This number can be changed
var imgScale = 3.75;

var imgSize = imgSizeActual / imgScale;
var cols = 12;
var rows = 16;
var board = {
    col0: [1, 13, 5, 11, 5, 1, 1, 5, 13, 5, 1, 30, 1, 1, 1, 1],
    col1: [4, 100, 1, 11, 1, 1, 1, 90, 13, 1, 52, 2, 1, 1, 5, 1],
    col2: [2, 13, 36, 11, 1, 60, 1, 1, 13, 60, 1, 1, 2, 1, 1, 4],
    col3: [1, 13, 4, 1, 40, 41, 96, 1, 41, 10, 10, 10, 1, 1, 5, 1],
    col4: [2, 13, 93, 71, 1, 1, 13, 1, 1, 50, 1, 4, 2, 1, 1, 4],
    col5: [12, 15, 41, 71, 1, 1, 13, 60, 93, 1, 5, 1, 1, 1, 5, 1],
    col6: [10, 10, 40, 71, 1, 36, 22, 10, 40, 10, 10, 10, 1, 1, 5, 1],
    col7: [2, 1, 1, 71, 1, 12, 41, 1, 3, 36, 1, 4, 2, 1, 5, 4],
    col8: [1, 1, 1, 71, 1, 8, 11, 1, 1, 60, 1, 1, 1, 1, 1, 1],
    col9: [2, 1, 3, 87, 70, 74, 11, 1, 13, 13, 1, 51, 2, 1, 5, 4],
    col10: [1, 60, 4, 71, 1, 88, 11, 1, 13, 19, 10, 10, 1, 1, 1, 1],
    col11: [30, 1, 3, 71, 3, 73, 11, 53, 73, 3, 1, 1, 1, 1, 5, 1]
};

var boardArr = [];

function createBoardArr(boardObj) {
    for (var key in board) {
        if (key.slice(0, 3) === 'col') boardArr.push(board[key]);
    }
    return boardArr;
}

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
            var tileSrc = '/img/tiles/' + boardArr[col][row] + '.jpg';
            //150x150 is the actual image size
            var tile = new PIXI.extras.TilingSprite.fromImage(tileSrc, imgSizeActual, imgSizeActual);

            tile.position.x = imgSize * row;
            tile.position.y = imgSize * cols - imgSize - imgSize * col;
            //rescales the 150px tile image to be 4 times smaller
            tile.scale.set(1 / imgScale, 1 / imgScale);

            stage.addChild(tile);
        }
    }
}

function buildMap() {
    createBoardArr();
    buildTiles();
    drawDockLine();
}

function init() {
    renderer.render(stage);
}

buildMap();

app.controller('GameCtrl', function ($scope, $state, theGame) {

    // window.start()
    $scope.game = theGame;
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

    var testkey = '56f88fcc06f200af25a0a5f9';

    $scope.localConnection = FirebaseFactory.getBase();

    $scope.games = ["game1", "game2", "game3", "game4"];

    $scope.info = ['game1 info', 'game2 info', 'game3 info', 'game4 info'];
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
app.controller("WaitingRoomController", function ($scope, game, $stateParams, PlayerFactory, FirebaseFactory) {

    $scope.gameID = $stateParams.id;

    $scope.localGame = FirebaseFactory.getConnection($scope.gameID + '/game' + '/players');

    $scope.game = game;
    $scope.robots = [{ name: "Spin Bot", imgUrl: "/img/robots/spinbot.jpg" }, { name: "Twonky", imgUrl: "/img/robots/twonky.jpg" }, { name: "Zoom Bot", imgUrl: "/img/robots/zoombot.jpg" }];

    $scope.CreatePlayer = function (player, gameID) {
        return PlayerFactory.createPlayer(player, $scope.gameID).then(function (playerInfo) {
            console.log('this is the response', playerInfo);
            // $state.go('waitingroom', {id: gameInfo._id})
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

app.directive('board', function () {

    return {
        restrict: 'E',
        templateUrl: '/js/game/board/board.html',
        scope: {
            game: '='
        },
        link: function link(scope, element) {
            window.start();
            // 	var board = {
            //    col0: [1, 13, 5, 11, 5, 1, 1, 5, 13, 5, 1, 30, 1, 1, 1, 1],
            //    col1: [4, 100, 1, 11, 1, 1, 1, 90, 13, 1, 52, 2, 1, 1, 5, 1],
            //    col2: [2, 13, 36, 11, 1, 60, 1, 1, 13, 60, 1, 1, 2, 1, 1, 4],
            //    col3: [1, 13, 4, 1, 40, 41, 96, 1, 41, 10, 10, 10, 1, 1, 5, 1],
            //    col4: [2, 13, 93, 71, 1, 1, 13, 1, 1, 50, 1, 4, 2, 1, 1, 4],
            //    col5: [12, 15, 41, 71, 1, 1, 13, 60, 93, 1, 5, 1, 1, 1, 5, 1],
            //    col6: [10, 10, 40, 71, 1, 36, 22, 10, 40, 10, 10, 10, 1, 1, 5, 1],
            //    col7: [2, 1, 1, 71, 1, 12, 41, 1, 3, 36, 1, 4, 2, 1, 5, 4],
            //    col8: [1, 1, 1, 71, 1, 8, 11, 1, 1, 60, 1, 1, 1, 1, 1, 1],
            //    col9: [2, 1, 3, 87, 70, 74, 11, 1, 13, 13, 1, 51, 2, 1, 5, 4],
            //    col10: [1, 60, 4, 71, 1, 88, 11, 1, 13, 19, 10, 10, 1, 1, 1, 1],
            //    col11: [30, 1, 3, 71, 3, 73, 11, 53, 73, 3, 1, 1, 1, 1, 5, 1]
            // }
            init();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiY3JlYXRlZ2FtZS9jcmVhdGVnYW1lLmNvbnRyb2xsZXIuanMiLCJjcmVhdGVnYW1lL2NyZWF0ZWdhbWUuc3RhdGUuanMiLCJkb2NzL2RvY3MuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImdhbWUvZHJhdy1ib2FyZC5qcyIsImdhbWUvZ2FtZS5jb250cm9sbGVyLmpzIiwiZ2FtZS9nYW1lLnN0YXRlLmpzIiwiaG9tZS9ob21lLmpzIiwibG9iYnkvbG9iYnkuY29udHJvbGxlci5qcyIsImxvYmJ5L2xvYmJ5LnN0YXRlLmpzIiwibG9naW4vbG9naW4uanMiLCJ3YWl0aW5ncm9vbS93YWl0aW5ncm9vbS5jb250cm9sbGVyLmpzIiwid2FpdGluZ3Jvb20vd2FpdGluZ3Jvb20uc3RhdGUuanMiLCJtZW1iZXJzLW9ubHkvbWVtYmVycy1vbmx5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9Cb2FyZEZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL0ZpcmViYXNlRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRnVsbHN0YWNrUGljcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvR2FtZUZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL1BsYXllckZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL1JhbmRvbUdyZWV0aW5ncy5qcyIsImdhbWUvYm9hcmQvYm9hcmQuZGlyZWN0aXZlLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJjb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQTs7QUFFQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxRQUFBLDRCQUFBLEdBQUEsU0FBQSw0QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtLQUNBLENBQUE7Ozs7QUFJQSxjQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsNEJBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7QUFFQSxZQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7O0FBR0EsYUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQ2xEQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUE7OztBQUdBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2hCQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLE1BQUEsR0FBQSxNQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEseUJBQUEsRUFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxNQUFBLEVBQUEsd0JBQUEsRUFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEseUJBQUEsRUFBQSxDQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsV0FBQSxDQUFBLG1CQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsc0JBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxRQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNiQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGFBQUE7QUFDQSxrQkFBQSxFQUFBLHNCQUFBO0FBQ0EsbUJBQUEsRUFBQSwrQkFBQTtBQUNBLGVBQUEsRUFBQTtBQUNBLGtCQUFBLEVBQUEsZ0JBQUEsWUFBQSxFQUFBO0FBQ0EsdUJBQUEsWUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ1hBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsT0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDTEEsQ0FBQSxZQUFBOztBQUVBLGdCQUFBLENBQUE7OztBQUdBLFFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBOztBQUVBLFFBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOzs7OztBQUtBLE9BQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0Esb0JBQUEsRUFBQSxvQkFBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7QUFDQSxxQkFBQSxFQUFBLHFCQUFBO0FBQ0Esc0JBQUEsRUFBQSxzQkFBQTtBQUNBLHdCQUFBLEVBQUEsd0JBQUE7QUFDQSxxQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxFQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsWUFBQSxVQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQSxDQUFBLGdCQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxhQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7QUFDQSx5QkFBQSxFQUFBLHVCQUFBLFFBQUEsRUFBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxhQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxXQUFBLEVBQ0EsVUFBQSxTQUFBLEVBQUE7QUFDQSxtQkFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtTQUNBLENBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQTs7QUFFQSxpQkFBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0E7Ozs7QUFJQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTs7Ozs7Ozs7OztBQVVBLGdCQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsSUFBQSxVQUFBLEtBQUEsSUFBQSxFQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7YUFDQTs7Ozs7QUFLQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsV0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsV0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7S0FFQSxDQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFlBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLEVBQUEsQ0FBQTs7QUNwSUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQTs7QUFFQSxJQUFBLEtBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBOzs7QUFHQSxJQUFBLGFBQUEsR0FBQSxHQUFBLENBQUE7OztBQUdBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxJQUFBLE9BQUEsR0FBQSxhQUFBLEdBQUEsUUFBQSxDQUFBO0FBQ0EsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsSUFBQSxLQUFBLEdBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7Q0FDQSxDQUFBOztBQUlBLElBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxTQUFBLGNBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBLEtBQUEsRUFBQTtBQUNBLFlBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsS0FBQSxFQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTtBQUNBLFdBQUEsUUFBQSxDQUFBO0NBQ0E7O0FBRUEsU0FBQSxZQUFBLEdBQUE7QUFDQSxRQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxHQUFBLGFBQUEsR0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsR0FBQSxhQUFBLEdBQUEsUUFBQSxFQUFBLEVBQUEsR0FBQSxhQUFBLEdBQUEsUUFBQSxDQUFBLENBQUE7O0FBRUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtDQUNBOztBQUVBLFNBQUEsVUFBQSxHQUFBO0FBQ0EsU0FBQSxJQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxPQUFBLEdBQUEsYUFBQSxHQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7O0FBRUEsZ0JBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxDQUFBLENBQUE7O0FBRUEsZ0JBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLElBQUEsR0FBQSxPQUFBLEdBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQTs7QUFFQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsUUFBQSxDQUFBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBO0NBQ0E7O0FBRUEsU0FBQSxRQUFBLEdBQUE7QUFDQSxrQkFBQSxFQUFBLENBQUE7QUFDQSxjQUFBLEVBQUEsQ0FBQTtBQUNBLGdCQUFBLEVBQUEsQ0FBQTtDQUNBOztBQUdBLFNBQUEsSUFBQSxHQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtDQUNBOztBQUVBLFFBQUEsRUFBQSxDQUFBOztBQy9FQSxHQUFBLENBQUEsVUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBOzs7QUFHQSxVQUFBLENBQUEsSUFBQSxHQUFBLE9BQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUNMQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxlQUFBO0FBQ0EsbUJBQUEsRUFBQSxvQkFBQTtBQUNBLGtCQUFBLEVBQUEsVUFBQTtBQUNBLGVBQUEsRUFBQTtBQUNBLG1CQUFBLEVBQUEsaUJBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQTtBQUNBLHVCQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDWkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMQSxHQUFBLENBQUEsVUFBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsZUFBQSxFQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBLDBCQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLGVBQUEsR0FBQSxlQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFlBQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ1ZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0Esa0JBQUEsRUFBQSxnQkFBQSxZQUFBLEVBQUE7QUFDQSx1QkFBQSxZQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7YUFDQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDWEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7QUFDQSxrQkFBQSxFQUFBLFdBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBRUEsY0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSw0QkFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQzNCQSxHQUFBLENBQUEsVUFBQSxDQUFBLHVCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsZUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLEVBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLGVBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsR0FBQSxPQUFBLEdBQUEsVUFBQSxDQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSx5QkFBQSxFQUFBLEVBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSx3QkFBQSxFQUFBLEVBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSx5QkFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsYUFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7O1NBRUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ2hCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGtCQUFBO0FBQ0EsbUJBQUEsRUFBQSxpQ0FBQTtBQUNBLGtCQUFBLEVBQUEsdUJBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLGNBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNaQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxlQUFBO0FBQ0EsZ0JBQUEsRUFBQSxtRUFBQTtBQUNBLGtCQUFBLEVBQUEsb0JBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7OztBQUdBLFlBQUEsRUFBQTtBQUNBLHdCQUFBLEVBQUEsSUFBQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsUUFBQSxHQUFBLFNBQUEsUUFBQSxHQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxRQUFBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQy9CQSxHQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFdBQUE7QUFDQSxvQkFBQSxFQUFBLHdCQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBO3VCQUFBLFFBQUEsQ0FBQSxJQUFBO2FBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxtQkFBQSxFQUFBLHFCQUFBLE9BQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxHQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUE7dUJBQUEsUUFBQSxDQUFBLElBQUE7YUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNYQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxlQUFBLEVBQUE7O0FBRUEsUUFBQSxlQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBLGdEQUFBLENBQUE7QUFDQSxRQUFBLGNBQUEsR0FBQSxlQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLGFBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsZUFBQSxHQUFBLGVBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsZUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxjQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUEsZUFBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDbEJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLENBQ0EsdURBQUEsRUFDQSxxSEFBQSxFQUNBLGlEQUFBLEVBQ0EsaURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxDQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDN0JBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxlQUFBLENBQUEsbUJBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNuQkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxhQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQSxhQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNiQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTs7QUFFQSxRQUFBLGtCQUFBLEdBQUEsU0FBQSxrQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLFNBQUEsR0FBQSxDQUNBLGVBQUEsRUFDQSx1QkFBQSxFQUNBLHNCQUFBLEVBQ0EsdUJBQUEsRUFDQSx5REFBQSxFQUNBLDBDQUFBLEVBQ0EsY0FBQSxFQUNBLHVCQUFBLEVBQ0EsSUFBQSxFQUNBLGlDQUFBLEVBQ0EsMERBQUEsRUFDQSw2RUFBQSxDQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGlCQUFBLEVBQUEsU0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxrQkFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQzVCQSxHQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsRUFBQSxZQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLDJCQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO1NBQ0E7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsZ0JBQUEsRUFBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDNUJBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLHlDQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBOztBQUVBLGlCQUFBLENBQUEsS0FBQSxHQUFBLENBQ0EsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsY0FBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSwyQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsMEJBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSwyQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLHlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsbUJBQUEsRUFBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtTQUVBOztLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZScsICdmaXJlYmFzZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgICAgdXJsOiAnL2Fib3V0JyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0Q29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYWJvdXQvYWJvdXQuaHRtbCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBYm91dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBGdWxsc3RhY2tQaWNzKSB7XG5cbiAgICAvLyBJbWFnZXMgb2YgYmVhdXRpZnVsIEZ1bGxzdGFjayBwZW9wbGUuXG4gICAgJHNjb3BlLmltYWdlcyA9IF8uc2h1ZmZsZShGdWxsc3RhY2tQaWNzKTtcblxufSk7IiwiYXBwLmNvbnRyb2xsZXIoXCJDcmVhdGVHYW1lQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsIGJvYXJkcywgR2FtZUZhY3RvcnksICRzdGF0ZSkge1xuXG5cdCRzY29wZS5ib2FyZHMgPSBib2FyZHNcblxuXHQkc2NvcGUucm9ib3RzID0gW3tuYW1lOiBcIlNwaW4gQm90XCIsIGltZ1VybDogXCIvaW1nL3JvYm90cy9zcGluYm90LmpwZ1wifSwge25hbWU6IFwiVHdvbmt5XCIsIGltZ1VybDogXCIvaW1nL3JvYm90cy90d29ua3kuanBnXCJ9LCB7bmFtZTogXCJab29tIEJvdFwiLCBpbWdVcmw6IFwiL2ltZy9yb2JvdHMvem9vbWJvdC5qcGdcIn1dXG5cblx0JHNjb3BlLkNyZWF0ZUdhbWUgPSBmdW5jdGlvbihnYW1lKSB7XG5cdFx0cmV0dXJuIEdhbWVGYWN0b3J5LmNyZWF0ZVBsYXllckFuZEdhbWUoZ2FtZSlcblx0XHQudGhlbihmdW5jdGlvbihnYW1lSW5mbykge1xuXHRcdFx0Y29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHJlc3BvbnNlJywgZ2FtZUluZm8pXG5cdFx0XHQkc3RhdGUuZ28oJ3dhaXRpbmdyb29tJywge2lkOiBnYW1lSW5mby5faWR9KVxuXHRcdH0pXG5cdH1cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjcmVhdGVnYW1lJywge1xuXHRcdHVybDogJy9jcmVhdGVnYW1lJyxcblx0XHRjb250cm9sbGVyOiAnQ3JlYXRlR2FtZUNvbnRyb2xsZXInLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvY3JlYXRlZ2FtZS9jcmVhdGVnYW1lLmh0bWwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGJvYXJkczogZnVuY3Rpb24oQm9hcmRGYWN0b3J5KSB7XG5cdFx0XHRcdHJldHVybiBCb2FyZEZhY3RvcnkuZ2V0QWxsQm9hcmRzKClcblx0XHRcdH1cblx0XHR9XG5cdH0pXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2RvY3MnLCB7XG4gICAgICAgIHVybDogJy9kb2NzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kb2NzL2RvY3MuaHRtbCdcbiAgICB9KTtcbn0pO1xuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ1NvY2tldCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbiAoJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbiAoZnJvbVNlcnZlcikge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcbiAgICAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7XG4iLCJ3aW5kb3cuc3RhcnQgPSBmdW5jdGlvbigpe1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkXCIpLmFwcGVuZENoaWxkKHJlbmRlcmVyLnZpZXcpO1xufVxuXG52YXIgc3RhZ2UgPSBuZXcgUElYSS5TdGFnZSgweDY2ZmY5OSk7XG52YXIgcmVuZGVyZXIgPSBuZXcgUElYSS5DYW52YXNSZW5kZXJlcig2NDAsNDgwKTtcblxuLy9hbGwgaW1hZ2UgZmlsZXMgYXJlIDE1MHB4LiBEbyBub3QgY2hhbmdlIHRoaXMgbnVtYmVyIVxudmFyIGltZ1NpemVBY3R1YWwgPSAxNTAgXG5cbi8vZmFjdG9yIHRvIHJlc2NhbGUgaW1hZ2VzIGJ5LiBUaGlzIG51bWJlciBjYW4gYmUgY2hhbmdlZFxudmFyIGltZ1NjYWxlID0gMy43NSBcblxudmFyIGltZ1NpemUgPSBpbWdTaXplQWN0dWFsL2ltZ1NjYWxlXG52YXIgY29scyA9IDEyO1xudmFyIHJvd3MgPSAxNjtcbnZhciBib2FyZCA9IHtcbiAgICAgICAgICBjb2wwOiBbMSwgMTMsIDUsIDExLCA1LCAxLCAxLCA1LCAxMywgNSwgMSwgMzAsIDEsIDEsIDEsIDFdLFxuICAgICAgICAgIGNvbDE6IFs0LCAxMDAsIDEsIDExLCAxLCAxLCAxLCA5MCwgMTMsIDEsIDUyLCAyLCAxLCAxLCA1LCAxXSxcbiAgICAgICAgICBjb2wyOiBbMiwgMTMsIDM2LCAxMSwgMSwgNjAsIDEsIDEsIDEzLCA2MCwgMSwgMSwgMiwgMSwgMSwgNF0sIFxuICAgICAgICAgIGNvbDM6IFsxLCAxMywgNCwgMSwgNDAsIDQxLCA5NiwgMSwgNDEsIDEwLCAxMCwgMTAsIDEsIDEsIDUsIDFdLCBcbiAgICAgICAgICBjb2w0OiBbMiwgMTMsIDkzLCA3MSwgMSwgMSwgMTMsIDEsIDEsIDUwLCAxLCA0LCAyLCAxLCAxLCA0XSxcbiAgICAgICAgICBjb2w1OiBbMTIsIDE1LCA0MSwgNzEsIDEsIDEsIDEzLCA2MCwgOTMsIDEsIDUsIDEsIDEsIDEsIDUsIDFdLFxuICAgICAgICAgIGNvbDY6IFsxMCwgMTAsIDQwLCA3MSwgMSwgMzYsIDIyLCAxMCwgNDAsIDEwLCAxMCwgMTAsIDEsIDEsIDUsIDFdLFxuICAgICAgICAgIGNvbDc6IFsyLCAxLCAxLCA3MSwgMSwgMTIsIDQxLCAxLCAzLCAzNiwgMSwgNCwgMiwgMSwgNSwgNF0sXG4gICAgICAgICAgY29sODogWzEsIDEsIDEsIDcxLCAxLCA4LCAxMSwgMSwgMSwgNjAsIDEsIDEsIDEsIDEsIDEsIDFdLFxuICAgICAgICAgIGNvbDk6IFsyLCAxLCAzLCA4NywgNzAsIDc0LCAxMSwgMSwgMTMsIDEzLCAxLCA1MSwgMiwgMSwgNSwgNF0sXG4gICAgICAgICAgY29sMTA6IFsxLCA2MCwgNCwgNzEsIDEsIDg4LCAxMSwgMSwgMTMsIDE5LCAxMCwgMTAsIDEsIDEsIDEsIDFdLFxuICAgICAgICAgIGNvbDExOiBbMzAsIDEsIDMsIDcxLCAzLCA3MywgMTEsIDUzLCA3MywgMywgMSwgMSwgMSwgMSwgNSwgMV1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICBcbnZhciBib2FyZEFyciA9IFtdO1xuXG5mdW5jdGlvbiBjcmVhdGVCb2FyZEFyciAoYm9hcmRPYmopIHtcbiAgZm9yKHZhciBrZXkgaW4gYm9hcmQpIHtcbiAgICBpZihrZXkuc2xpY2UoMCwzKSA9PT0gJ2NvbCcpIGJvYXJkQXJyLnB1c2goYm9hcmRba2V5XSlcbiAgfVxuICByZXR1cm4gYm9hcmRBcnI7XG59XG5cbmZ1bmN0aW9uIGRyYXdEb2NrTGluZSgpIHtcbiAgdmFyIGxpbmUgPSBuZXcgUElYSS5HcmFwaGljcztcbiAgbGluZS5saW5lU3R5bGUoNCwgMHgwMDAwMDAsIDEpO1xuICBsaW5lLm1vdmVUbygxMippbWdTaXplQWN0dWFsL2ltZ1NjYWxlLCAwKVxuICBsaW5lLmxpbmVUbygxMippbWdTaXplQWN0dWFsL2ltZ1NjYWxlLCAxMippbWdTaXplQWN0dWFsL2ltZ1NjYWxlKVxuXG4gIHN0YWdlLmFkZENoaWxkKGxpbmUpXG59XG5cbmZ1bmN0aW9uIGJ1aWxkVGlsZXMoKSB7XG4gIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IGNvbHM7IGNvbCArKyl7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgcm93czsgcm93ICsrKXtcbiAgICAgIHZhciB0aWxlU3JjID0gJy9pbWcvdGlsZXMvJyArIGJvYXJkQXJyW2NvbF1bcm93XSArICcuanBnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLzE1MHgxNTAgaXMgdGhlIGFjdHVhbCBpbWFnZSBzaXplXG4gICAgICB2YXIgdGlsZSA9IG5ldyBQSVhJLmV4dHJhcy5UaWxpbmdTcHJpdGUuZnJvbUltYWdlKHRpbGVTcmMsIGltZ1NpemVBY3R1YWwsIGltZ1NpemVBY3R1YWwpXG4gICAgICBcbiAgICAgIHRpbGUucG9zaXRpb24ueCA9IGltZ1NpemUqcm93XG4gICAgICB0aWxlLnBvc2l0aW9uLnkgPSBpbWdTaXplKmNvbHMgLSBpbWdTaXplIC0gaW1nU2l6ZSAqIGNvbDtcbiAgICAgIC8vcmVzY2FsZXMgdGhlIDE1MHB4IHRpbGUgaW1hZ2UgdG8gYmUgNCB0aW1lcyBzbWFsbGVyIFxuICAgICAgdGlsZS5zY2FsZS5zZXQoMS9pbWdTY2FsZSwgMS9pbWdTY2FsZSk7XG5cbiAgICAgIHN0YWdlLmFkZENoaWxkKHRpbGUpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkTWFwKCl7XG4gIGNyZWF0ZUJvYXJkQXJyKCk7XG4gIGJ1aWxkVGlsZXMoKTtcbiAgZHJhd0RvY2tMaW5lKCk7XG59XG5cblxuZnVuY3Rpb24gaW5pdCgpe1xuICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xufVxuXG5idWlsZE1hcCgpO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ0dhbWVDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIHRoZUdhbWUpe1xuXG5cdC8vIHdpbmRvdy5zdGFydCgpXG4gICRzY29wZS5nYW1lID0gdGhlR2FtZTsgIFxuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcbiAgICAgIHVybDogJy9nYW1lLzpnYW1lSWQnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvanMvZ2FtZS9nYW1lLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0dhbWVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdGhlR2FtZTogZnVuY3Rpb24oR2FtZUZhY3RvcnksICRzdGF0ZVBhcmFtcykge1xuICAgICAgICAgIHJldHVybiBHYW1lRmFjdG9yeS5nZXRHYW1lKCRzdGF0ZVBhcmFtcy5nYW1lSWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS9ob21lLmh0bWwnXG4gICAgfSk7XG59KTsiLCJhcHAuY29udHJvbGxlcihcIkxvYmJ5Q29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsIEZpcmViYXNlRmFjdG9yeSkge1xuXG5cdHZhciB0ZXN0a2V5ID0gJzU2Zjg4ZmNjMDZmMjAwYWYyNWEwYTVmOSdcblx0XG5cdCRzY29wZS5sb2NhbENvbm5lY3Rpb24gPSBGaXJlYmFzZUZhY3RvcnkuZ2V0QmFzZSgpXG5cblx0JHNjb3BlLmdhbWVzID0gW1wiZ2FtZTFcIiwgXCJnYW1lMlwiLCBcImdhbWUzXCIsIFwiZ2FtZTRcIl1cblxuXHQkc2NvcGUuaW5mbyA9IFsnZ2FtZTEgaW5mbycsICdnYW1lMiBpbmZvJywgJ2dhbWUzIGluZm8nLCAnZ2FtZTQgaW5mbyddXG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2JieScsIHtcblx0XHR1cmw6ICcvbG9iYnknLFxuXHRcdGNvbnRyb2xsZXI6ICdMb2JieUNvbnRyb2xsZXInLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvbG9iYnkvbG9iYnkuaHRtbCcsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0Ym9hcmRzOiBmdW5jdGlvbihCb2FyZEZhY3RvcnkpIHtcblx0XHRcdFx0cmV0dXJuIEJvYXJkRmFjdG9yeS5nZXRBbGxCb2FyZHMoKVxuXHRcdFx0fVxuXHRcdH1cblx0fSlcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgJHNjb3BlLnNlbmRMb2dpbiA9IGZ1bmN0aW9uIChsb2dpbkluZm8pIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luSW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29udHJvbGxlcihcIldhaXRpbmdSb29tQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsIGdhbWUsICRzdGF0ZVBhcmFtcywgUGxheWVyRmFjdG9yeSwgRmlyZWJhc2VGYWN0b3J5KSB7XG5cblx0JHNjb3BlLmdhbWVJRCA9ICRzdGF0ZVBhcmFtcy5pZFxuXG5cdCRzY29wZS5sb2NhbEdhbWUgPSBGaXJlYmFzZUZhY3RvcnkuZ2V0Q29ubmVjdGlvbigkc2NvcGUuZ2FtZUlEICsgJy9nYW1lJyArICcvcGxheWVycycpXG5cblx0JHNjb3BlLmdhbWUgPSBnYW1lXG5cdCRzY29wZS5yb2JvdHMgPSBbe25hbWU6IFwiU3BpbiBCb3RcIiwgaW1nVXJsOiBcIi9pbWcvcm9ib3RzL3NwaW5ib3QuanBnXCJ9LCB7bmFtZTogXCJUd29ua3lcIiwgaW1nVXJsOiBcIi9pbWcvcm9ib3RzL3R3b25reS5qcGdcIn0sIHtuYW1lOiBcIlpvb20gQm90XCIsIGltZ1VybDogXCIvaW1nL3JvYm90cy96b29tYm90LmpwZ1wifV1cblxuXHQkc2NvcGUuQ3JlYXRlUGxheWVyID0gZnVuY3Rpb24ocGxheWVyLCBnYW1lSUQpIHtcblx0XHRyZXR1cm4gUGxheWVyRmFjdG9yeS5jcmVhdGVQbGF5ZXIocGxheWVyLCAkc2NvcGUuZ2FtZUlEKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHBsYXllckluZm8pIHtcblx0XHRcdGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByZXNwb25zZScsIHBsYXllckluZm8pXG5cdFx0XHQvLyAkc3RhdGUuZ28oJ3dhaXRpbmdyb29tJywge2lkOiBnYW1lSW5mby5faWR9KVxuXHRcdH0pXG5cdH1cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd3YWl0aW5ncm9vbScsIHtcblx0XHR1cmw6ICcvd2FpdGluZ3Jvb20vOmlkJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL3dhaXRpbmdyb29tL3dhaXRpbmdyb29tLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdXYWl0aW5nUm9vbUNvbnRyb2xsZXInLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGdhbWU6IGZ1bmN0aW9uKEdhbWVGYWN0b3J5LCAkc3RhdGVQYXJhbXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHN0YXRlUGFyYW1zOicsICRzdGF0ZVBhcmFtcylcblx0XHRcdFx0cmV0dXJuIEdhbWVGYWN0b3J5LmdldEdhbWUoJHN0YXRlUGFyYW1zLmlkKVxuXHRcdFx0fVxuXHRcdH1cblx0fSlcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXG4gICAgICAgIHRlbXBsYXRlOiAnPGltZyBuZy1yZXBlYXQ9XCJpdGVtIGluIHN0YXNoXCIgd2lkdGg9XCIzMDBcIiBuZy1zcmM9XCJ7eyBpdGVtIH19XCIgLz4nLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGFzaCA9IHN0YXNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGF0YS5hdXRoZW50aWNhdGUgaXMgcmVhZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnU2VjcmV0U3Rhc2gnLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3NlY3JldC1zdGFzaCcpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0YXNoOiBnZXRTdGFzaFxuICAgIH07XG5cbn0pOyIsImFwcC5mYWN0b3J5KCdCb2FyZEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG5cdHJldHVybiB7XG5cdFx0Z2V0QWxsQm9hcmRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvYm9hcmQvJylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmRhdGEpXG5cdFx0fSxcblx0XHRnZXRPbmVCb2FyZDogZnVuY3Rpb24oYm9hcmRJZCkge1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9ib2FyZC8nICsgYm9hcmRJZClcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmRhdGEpXG5cdFx0fVxuXHR9XG59KSIsImFwcC5mYWN0b3J5KCdGaXJlYmFzZUZhY3RvcnknLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QpIHtcblxuXHR2YXIgRmlyZWJhc2VGYWN0b3J5ID0ge307XG5cblx0dmFyIGJhc2VVcmwgPSBcImh0dHBzOi8vcmVzcGxlbmRlbnQtdG9yY2gtNDMyMi5maXJlYmFzZWlvLmNvbS9cIjtcblx0dmFyIGJhc2VDb25uZWN0aW9uID0gJGZpcmViYXNlT2JqZWN0KG5ldyBGaXJlYmFzZShiYXNlVXJsKSlcblxuXHRGaXJlYmFzZUZhY3RvcnkuZ2V0Q29ubmVjdGlvbiA9IGZ1bmN0aW9uKGtleSkge1xuXHRcdHZhciBsb2NhbENvbm5lY3Rpb24gPSAkZmlyZWJhc2VPYmplY3QobmV3IEZpcmViYXNlKGJhc2VVcmwgKyBrZXkpKVxuXHRcdHJldHVybiBsb2NhbENvbm5lY3Rpb25cblx0fVxuXG5cdEZpcmViYXNlRmFjdG9yeS5nZXRCYXNlID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGJhc2VDb25uZWN0aW9uXG5cdH1cblxuXHRyZXR1cm4gRmlyZWJhc2VGYWN0b3J5XG5cbn0pIiwiYXBwLmZhY3RvcnkoJ0Z1bGxzdGFja1BpY3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CN2dCWHVsQ0FBQVhRY0UuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vZmJjZG4tc3Bob3Rvcy1jLWEuYWthbWFpaGQubmV0L2hwaG90b3MtYWsteGFwMS90MzEuMC04LzEwODYyNDUxXzEwMjA1NjIyOTkwMzU5MjQxXzgwMjcxNjg4NDMzMTI4NDExMzdfby5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItTEtVc2hJZ0FFeTlTSy5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3OS1YN29DTUFBa3c3eS5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItVWo5Q09JSUFJRkFoMC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I2eUl5RmlDRUFBcWwxMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFLVQ3NWxXQUFBbXFxSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFdlpBZy1WQUFBazkzMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFZ05NZU9YSUFJZkRoSy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFUXlJRE5XZ0FBdTYwQi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NDRjNUNVFXOEFFMmxHSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBZVZ3NVNXb0FBQUxzai5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBYUpJUDdVa0FBbElHcy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBUU93OWxXRUFBWTlGbC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItT1FiVnJDTUFBTndJTS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I5Yl9lcndDWUFBd1JjSi5wbmc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I1UFRkdm5DY0FFQWw0eC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I0cXdDMGlDWUFBbFBHaC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0IyYjMzdlJJVUFBOW8xRC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0J3cEl3cjFJVUFBdk8yXy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0JzU3NlQU5DWUFFT2hMdy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NKNHZMZnVVd0FBZGE0TC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJN3d6akVWRUFBT1BwUy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJZEh2VDJVc0FBbm5IVi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NHQ2lQX1lXWUFBbzc1Vi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJUzRKUElXSUFJMzdxdS5qcGc6bGFyZ2UnXG4gICAgXTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ0dhbWVGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuXHRcblx0dmFyIEdhbWVGYWN0b3J5ID0ge307XG5cblx0R2FtZUZhY3RvcnkuY3JlYXRlUGxheWVyQW5kR2FtZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9nYW1lLycsIGRhdGEpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRyZXR1cm4gcmVzLmRhdGFcblx0XHR9KVxuXHR9XG5cblx0R2FtZUZhY3RvcnkuZ2V0R2FtZSA9IGZ1bmN0aW9uKGdhbWVJZCl7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9nYW1lLycgKyBnYW1lSWQpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzKXtcblx0XHRcdHJldHVybiByZXMuZGF0YVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIEdhbWVGYWN0b3J5O1xufSkiLCJhcHAuZmFjdG9yeSgnUGxheWVyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG5cblx0dmFyIFBsYXllckZhY3RvcnkgPSB7fTtcblxuXHRQbGF5ZXJGYWN0b3J5LmNyZWF0ZVBsYXllciA9IGZ1bmN0aW9uKGRhdGEsIGlkKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcGxheWVyLycsIHtwYXJhbXM6e1wiZGF0YVwiOiBkYXRhLCBcImlkXCI6IGlkfX0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRyZXR1cm4gcmVzLmRhdGFcblx0XHR9KVxuXHR9XG5cblx0cmV0dXJuIFBsYXllckZhY3RvcnlcblxufSkiLCJhcHAuZmFjdG9yeSgnUmFuZG9tR3JlZXRpbmdzJywgZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGdldFJhbmRvbUZyb21BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgcmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV07XG4gICAgfTtcblxuICAgIHZhciBncmVldGluZ3MgPSBbXG4gICAgICAgICdIZWxsbywgd29ybGQhJyxcbiAgICAgICAgJ0F0IGxvbmcgbGFzdCwgSSBsaXZlIScsXG4gICAgICAgICdIZWxsbywgc2ltcGxlIGh1bWFuLicsXG4gICAgICAgICdXaGF0IGEgYmVhdXRpZnVsIGRheSEnLFxuICAgICAgICAnSVxcJ20gbGlrZSBhbnkgb3RoZXIgcHJvamVjdCwgZXhjZXB0IHRoYXQgSSBhbSB5b3Vycy4gOiknLFxuICAgICAgICAnVGhpcyBlbXB0eSBzdHJpbmcgaXMgZm9yIExpbmRzYXkgTGV2aW5lLicsXG4gICAgICAgICfjgZPjgpPjgavjgaHjga/jgIHjg6bjg7zjgrbjg7zmp5jjgIInLFxuICAgICAgICAnV2VsY29tZS4gVG8uIFdFQlNJVEUuJyxcbiAgICAgICAgJzpEJyxcbiAgICAgICAgJ1llcywgSSB0aGluayB3ZVxcJ3ZlIG1ldCBiZWZvcmUuJyxcbiAgICAgICAgJ0dpbW1lIDMgbWlucy4uLiBJIGp1c3QgZ3JhYmJlZCB0aGlzIHJlYWxseSBkb3BlIGZyaXR0YXRhJyxcbiAgICAgICAgJ0lmIENvb3BlciBjb3VsZCBvZmZlciBvbmx5IG9uZSBwaWVjZSBvZiBhZHZpY2UsIGl0IHdvdWxkIGJlIHRvIG5ldlNRVUlSUkVMIScsXG4gICAgXTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdyZWV0aW5nczogZ3JlZXRpbmdzLFxuICAgICAgICBnZXRSYW5kb21HcmVldGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFJhbmRvbUZyb21BcnJheShncmVldGluZ3MpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdib2FyZCcsIGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2dhbWUvYm9hcmQvYm9hcmQuaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgIFx0Z2FtZTogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICAgIFx0d2luZG93LnN0YXJ0KClcbiAgICAgICAgLy8gXHR2YXIgYm9hcmQgPSB7XG5cdCAgICAgICAvLyAgICBjb2wwOiBbMSwgMTMsIDUsIDExLCA1LCAxLCAxLCA1LCAxMywgNSwgMSwgMzAsIDEsIDEsIDEsIDFdLFxuXHQgICAgICAgLy8gICAgY29sMTogWzQsIDEwMCwgMSwgMTEsIDEsIDEsIDEsIDkwLCAxMywgMSwgNTIsIDIsIDEsIDEsIDUsIDFdLFxuXHQgICAgICAgLy8gICAgY29sMjogWzIsIDEzLCAzNiwgMTEsIDEsIDYwLCAxLCAxLCAxMywgNjAsIDEsIDEsIDIsIDEsIDEsIDRdLCBcblx0ICAgICAgIC8vICAgIGNvbDM6IFsxLCAxMywgNCwgMSwgNDAsIDQxLCA5NiwgMSwgNDEsIDEwLCAxMCwgMTAsIDEsIDEsIDUsIDFdLCBcblx0ICAgICAgIC8vICAgIGNvbDQ6IFsyLCAxMywgOTMsIDcxLCAxLCAxLCAxMywgMSwgMSwgNTAsIDEsIDQsIDIsIDEsIDEsIDRdLFxuXHQgICAgICAgLy8gICAgY29sNTogWzEyLCAxNSwgNDEsIDcxLCAxLCAxLCAxMywgNjAsIDkzLCAxLCA1LCAxLCAxLCAxLCA1LCAxXSxcblx0ICAgICAgIC8vICAgIGNvbDY6IFsxMCwgMTAsIDQwLCA3MSwgMSwgMzYsIDIyLCAxMCwgNDAsIDEwLCAxMCwgMTAsIDEsIDEsIDUsIDFdLFxuXHQgICAgICAgLy8gICAgY29sNzogWzIsIDEsIDEsIDcxLCAxLCAxMiwgNDEsIDEsIDMsIDM2LCAxLCA0LCAyLCAxLCA1LCA0XSxcblx0ICAgICAgIC8vICAgIGNvbDg6IFsxLCAxLCAxLCA3MSwgMSwgOCwgMTEsIDEsIDEsIDYwLCAxLCAxLCAxLCAxLCAxLCAxXSxcblx0ICAgICAgIC8vICAgIGNvbDk6IFsyLCAxLCAzLCA4NywgNzAsIDc0LCAxMSwgMSwgMTMsIDEzLCAxLCA1MSwgMiwgMSwgNSwgNF0sXG5cdCAgICAgICAvLyAgICBjb2wxMDogWzEsIDYwLCA0LCA3MSwgMSwgODgsIDExLCAxLCAxMywgMTksIDEwLCAxMCwgMSwgMSwgMSwgMV0sXG5cdCAgICAgICAvLyAgICBjb2wxMTogWzMwLCAxLCAzLCA3MSwgMywgNzMsIDExLCA1MywgNzMsIDMsIDEsIDEsIDEsIDEsIDUsIDFdXG4gICAgICBcdFx0Ly8gfVxuICAgICAgICBcdGluaXQoKVxuICAgICAgICB9XG4gICAgfVxuXG59KTsiLCJhcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCdcbiAgICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdIb21lJywgc3RhdGU6ICdob21lJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdBYm91dCcsIHN0YXRlOiAnbG9iYnknIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0RvY3VtZW50YXRpb24nLCBzdGF0ZTogJ2RvY3MnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ01lbWJlcnMgT25seScsIHN0YXRlOiAnbWVtYmVyc09ubHknLCBhdXRoOiB0cnVlIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
