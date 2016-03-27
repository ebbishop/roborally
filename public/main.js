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
app.controller("CreategameController", function ($scope, FirebaseFactory, boards) {

    $scope.boards = boards;
});
app.config(function ($stateProvider) {
    $stateProvider.state('creategame', {
        url: '/creategame',
        controller: 'CreategameController',
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

    var testkey = '1234';

    $scope.localConnection = FirebaseFactory.getConnection(testkey + '/game');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiY3JlYXRlZ2FtZS9jcmVhdGVnYW1lLmNvbnRyb2xsZXIuanMiLCJjcmVhdGVnYW1lL2NyZWF0ZWdhbWUuc3RhdGUuanMiLCJkb2NzL2RvY3MuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImdhbWUvZHJhdy1ib2FyZC5qcyIsImdhbWUvZ2FtZS5jb250cm9sbGVyLmpzIiwiZ2FtZS9nYW1lLnN0YXRlLmpzIiwiaG9tZS9ob21lLmpzIiwibG9iYnkvbG9iYnkuY29udHJvbGxlci5qcyIsImxvYmJ5L2xvYmJ5LnN0YXRlLmpzIiwibG9naW4vbG9naW4uanMiLCJtZW1iZXJzLW9ubHkvbWVtYmVycy1vbmx5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9Cb2FyZEZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL0ZpcmViYXNlRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRnVsbHN0YWNrUGljcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvR2FtZUZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL1JhbmRvbUdyZWV0aW5ncy5qcyIsImdhbWUvYm9hcmQvYm9hcmQuZGlyZWN0aXZlLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJjb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQTs7QUFFQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxRQUFBLDRCQUFBLEdBQUEsU0FBQSw0QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtLQUNBLENBQUE7Ozs7QUFJQSxjQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsNEJBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7QUFFQSxZQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7O0FBR0EsYUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQ2xEQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUE7OztBQUdBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2hCQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsZUFBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ0pBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsYUFBQTtBQUNBLGtCQUFBLEVBQUEsc0JBQUE7QUFDQSxtQkFBQSxFQUFBLCtCQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0Esa0JBQUEsRUFBQSxnQkFBQSxZQUFBLEVBQUE7QUFDQSx1QkFBQSxZQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7YUFDQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDWEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxPQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUNMQSxDQUFBLFlBQUE7O0FBRUEsZ0JBQUEsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7Ozs7O0FBS0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxvQkFBQSxFQUFBLG9CQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtBQUNBLHFCQUFBLEVBQUEscUJBQUE7QUFDQSxzQkFBQSxFQUFBLHNCQUFBO0FBQ0Esd0JBQUEsRUFBQSx3QkFBQTtBQUNBLHFCQUFBLEVBQUEscUJBQUE7S0FDQSxDQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLEVBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxZQUFBLFVBQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsZ0JBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQSxDQUFBLGFBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQSxDQUFBLGNBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQSxDQUFBLGNBQUE7U0FDQSxDQUFBO0FBQ0EsZUFBQTtBQUNBLHlCQUFBLEVBQUEsdUJBQUEsUUFBQSxFQUFBO0FBQ0EsMEJBQUEsQ0FBQSxVQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7YUFDQTtTQUNBLENBQUE7S0FDQSxDQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGFBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLFdBQUEsRUFDQSxVQUFBLFNBQUEsRUFBQTtBQUNBLG1CQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsRUFBQSxFQUFBOztBQUVBLGlCQUFBLGlCQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQTs7OztBQUlBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLG1CQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsVUFBQSxFQUFBOzs7Ozs7Ozs7O0FBVUEsZ0JBQUEsSUFBQSxDQUFBLGVBQUEsRUFBQSxJQUFBLFVBQUEsS0FBQSxJQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTthQUNBOzs7OztBQUtBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxXQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUNBLENBQUEsWUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsNEJBQUEsRUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0FBQ0EsMEJBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTtLQUVBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7O0FBRUEsWUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsRUFBQSxDQUFBOztBQ3BJQSxNQUFBLENBQUEsS0FBQSxHQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7Q0FDQSxDQUFBOztBQUVBLElBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7OztBQUdBLElBQUEsYUFBQSxHQUFBLEdBQUEsQ0FBQTs7O0FBR0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLElBQUEsT0FBQSxHQUFBLGFBQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxJQUFBLEtBQUEsR0FBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtDQUNBLENBQUE7O0FBSUEsSUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFNBQUEsY0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUEsS0FBQSxFQUFBO0FBQ0EsWUFBQSxHQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsS0FBQSxLQUFBLEVBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0FBQ0EsV0FBQSxRQUFBLENBQUE7Q0FDQTs7QUFFQSxTQUFBLFlBQUEsR0FBQTtBQUNBLFFBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEdBQUEsYUFBQSxHQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxHQUFBLGFBQUEsR0FBQSxRQUFBLEVBQUEsRUFBQSxHQUFBLGFBQUEsR0FBQSxRQUFBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0NBQ0E7O0FBRUEsU0FBQSxVQUFBLEdBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLE9BQUEsR0FBQSxhQUFBLEdBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQTs7QUFFQSxnQkFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLENBQUEsQ0FBQTs7QUFFQSxnQkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsSUFBQSxHQUFBLE9BQUEsR0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBOztBQUVBLGdCQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxRQUFBLENBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0E7Q0FDQTs7QUFFQSxTQUFBLFFBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsRUFBQSxDQUFBO0FBQ0EsZ0JBQUEsRUFBQSxDQUFBO0NBQ0E7O0FBR0EsU0FBQSxJQUFBLEdBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0NBQ0E7O0FBRUEsUUFBQSxFQUFBLENBQUE7O0FDL0VBLEdBQUEsQ0FBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUE7OztBQUdBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQ0xBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGVBQUE7QUFDQSxtQkFBQSxFQUFBLG9CQUFBO0FBQ0Esa0JBQUEsRUFBQSxVQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSxpQkFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBO0FBQ0EsdUJBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7YUFDQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNaQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0xBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxlQUFBLEVBQUE7O0FBSUEsUUFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsZUFBQSxDQUFBLGFBQUEsQ0FBQSxPQUFBLEdBQUEsT0FBQSxDQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFlBQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ1pBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0Esa0JBQUEsRUFBQSxnQkFBQSxZQUFBLEVBQUE7QUFDQSx1QkFBQSxZQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7YUFDQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDWEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7QUFDQSxrQkFBQSxFQUFBLFdBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBRUEsY0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSw0QkFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQzNCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxlQUFBO0FBQ0EsZ0JBQUEsRUFBQSxtRUFBQTtBQUNBLGtCQUFBLEVBQUEsb0JBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7OztBQUdBLFlBQUEsRUFBQTtBQUNBLHdCQUFBLEVBQUEsSUFBQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsUUFBQSxHQUFBLFNBQUEsUUFBQSxHQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxRQUFBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQy9CQSxHQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFdBQUE7QUFDQSxvQkFBQSxFQUFBLHdCQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBO3VCQUFBLFFBQUEsQ0FBQSxJQUFBO2FBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxtQkFBQSxFQUFBLHFCQUFBLE9BQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxHQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUE7dUJBQUEsUUFBQSxDQUFBLElBQUE7YUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNYQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxlQUFBLEVBQUE7O0FBRUEsUUFBQSxlQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBLGdEQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLGVBQUEsR0FBQSxlQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxlQUFBLGVBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQSxlQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNiQSxHQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQSxDQUNBLHVEQUFBLEVBQ0EscUhBQUEsRUFDQSxpREFBQSxFQUNBLGlEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsQ0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQzdCQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsZUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNaQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTs7QUFFQSxRQUFBLGtCQUFBLEdBQUEsU0FBQSxrQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLFNBQUEsR0FBQSxDQUNBLGVBQUEsRUFDQSx1QkFBQSxFQUNBLHNCQUFBLEVBQ0EsdUJBQUEsRUFDQSx5REFBQSxFQUNBLDBDQUFBLEVBQ0EsY0FBQSxFQUNBLHVCQUFBLEVBQ0EsSUFBQSxFQUNBLGlDQUFBLEVBQ0EsMERBQUEsRUFDQSw2RUFBQSxDQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGlCQUFBLEVBQUEsU0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxrQkFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQzVCQSxHQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsRUFBQSxZQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLDJCQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO1NBQ0E7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsZ0JBQUEsRUFBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDNUJBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLHlDQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBOztBQUVBLGlCQUFBLENBQUEsS0FBQSxHQUFBLENBQ0EsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsY0FBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSwyQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsMEJBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSwyQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLHlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsbUJBQUEsRUFBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtTQUVBOztLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZScsICdmaXJlYmFzZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgICAgdXJsOiAnL2Fib3V0JyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0Q29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYWJvdXQvYWJvdXQuaHRtbCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBYm91dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBGdWxsc3RhY2tQaWNzKSB7XG5cbiAgICAvLyBJbWFnZXMgb2YgYmVhdXRpZnVsIEZ1bGxzdGFjayBwZW9wbGUuXG4gICAgJHNjb3BlLmltYWdlcyA9IF8uc2h1ZmZsZShGdWxsc3RhY2tQaWNzKTtcblxufSk7IiwiYXBwLmNvbnRyb2xsZXIoXCJDcmVhdGVnYW1lQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsIEZpcmViYXNlRmFjdG9yeSwgYm9hcmRzKSB7XG5cblx0JHNjb3BlLmJvYXJkcyA9IGJvYXJkc1xuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpe1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnY3JlYXRlZ2FtZScsIHtcblx0XHR1cmw6ICcvY3JlYXRlZ2FtZScsXG5cdFx0Y29udHJvbGxlcjogJ0NyZWF0ZWdhbWVDb250cm9sbGVyJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2NyZWF0ZWdhbWUvY3JlYXRlZ2FtZS5odG1sJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRib2FyZHM6IGZ1bmN0aW9uKEJvYXJkRmFjdG9yeSkge1xuXHRcdFx0XHRyZXR1cm4gQm9hcmRGYWN0b3J5LmdldEFsbEJvYXJkcygpXG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb2NzJywge1xuICAgICAgICB1cmw6ICcvZG9jcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG9jcy9kb2NzLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpO1xuIiwid2luZG93LnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZFwiKS5hcHBlbmRDaGlsZChyZW5kZXJlci52aWV3KTtcbn1cblxudmFyIHN0YWdlID0gbmV3IFBJWEkuU3RhZ2UoMHg2NmZmOTkpO1xudmFyIHJlbmRlcmVyID0gbmV3IFBJWEkuQ2FudmFzUmVuZGVyZXIoNjQwLDQ4MCk7XG5cbi8vYWxsIGltYWdlIGZpbGVzIGFyZSAxNTBweC4gRG8gbm90IGNoYW5nZSB0aGlzIG51bWJlciFcbnZhciBpbWdTaXplQWN0dWFsID0gMTUwIFxuXG4vL2ZhY3RvciB0byByZXNjYWxlIGltYWdlcyBieS4gVGhpcyBudW1iZXIgY2FuIGJlIGNoYW5nZWRcbnZhciBpbWdTY2FsZSA9IDMuNzUgXG5cbnZhciBpbWdTaXplID0gaW1nU2l6ZUFjdHVhbC9pbWdTY2FsZVxudmFyIGNvbHMgPSAxMjtcbnZhciByb3dzID0gMTY7XG52YXIgYm9hcmQgPSB7XG4gICAgICAgICAgY29sMDogWzEsIDEzLCA1LCAxMSwgNSwgMSwgMSwgNSwgMTMsIDUsIDEsIDMwLCAxLCAxLCAxLCAxXSxcbiAgICAgICAgICBjb2wxOiBbNCwgMTAwLCAxLCAxMSwgMSwgMSwgMSwgOTAsIDEzLCAxLCA1MiwgMiwgMSwgMSwgNSwgMV0sXG4gICAgICAgICAgY29sMjogWzIsIDEzLCAzNiwgMTEsIDEsIDYwLCAxLCAxLCAxMywgNjAsIDEsIDEsIDIsIDEsIDEsIDRdLCBcbiAgICAgICAgICBjb2wzOiBbMSwgMTMsIDQsIDEsIDQwLCA0MSwgOTYsIDEsIDQxLCAxMCwgMTAsIDEwLCAxLCAxLCA1LCAxXSwgXG4gICAgICAgICAgY29sNDogWzIsIDEzLCA5MywgNzEsIDEsIDEsIDEzLCAxLCAxLCA1MCwgMSwgNCwgMiwgMSwgMSwgNF0sXG4gICAgICAgICAgY29sNTogWzEyLCAxNSwgNDEsIDcxLCAxLCAxLCAxMywgNjAsIDkzLCAxLCA1LCAxLCAxLCAxLCA1LCAxXSxcbiAgICAgICAgICBjb2w2OiBbMTAsIDEwLCA0MCwgNzEsIDEsIDM2LCAyMiwgMTAsIDQwLCAxMCwgMTAsIDEwLCAxLCAxLCA1LCAxXSxcbiAgICAgICAgICBjb2w3OiBbMiwgMSwgMSwgNzEsIDEsIDEyLCA0MSwgMSwgMywgMzYsIDEsIDQsIDIsIDEsIDUsIDRdLFxuICAgICAgICAgIGNvbDg6IFsxLCAxLCAxLCA3MSwgMSwgOCwgMTEsIDEsIDEsIDYwLCAxLCAxLCAxLCAxLCAxLCAxXSxcbiAgICAgICAgICBjb2w5OiBbMiwgMSwgMywgODcsIDcwLCA3NCwgMTEsIDEsIDEzLCAxMywgMSwgNTEsIDIsIDEsIDUsIDRdLFxuICAgICAgICAgIGNvbDEwOiBbMSwgNjAsIDQsIDcxLCAxLCA4OCwgMTEsIDEsIDEzLCAxOSwgMTAsIDEwLCAxLCAxLCAxLCAxXSxcbiAgICAgICAgICBjb2wxMTogWzMwLCAxLCAzLCA3MSwgMywgNzMsIDExLCA1MywgNzMsIDMsIDEsIDEsIDEsIDEsIDUsIDFdXG4gICAgICAgIH1cblxuXG4gICAgICAgICAgICAgXG52YXIgYm9hcmRBcnIgPSBbXTtcblxuZnVuY3Rpb24gY3JlYXRlQm9hcmRBcnIgKGJvYXJkT2JqKSB7XG4gIGZvcih2YXIga2V5IGluIGJvYXJkKSB7XG4gICAgaWYoa2V5LnNsaWNlKDAsMykgPT09ICdjb2wnKSBib2FyZEFyci5wdXNoKGJvYXJkW2tleV0pXG4gIH1cbiAgcmV0dXJuIGJvYXJkQXJyO1xufVxuXG5mdW5jdGlvbiBkcmF3RG9ja0xpbmUoKSB7XG4gIHZhciBsaW5lID0gbmV3IFBJWEkuR3JhcGhpY3M7XG4gIGxpbmUubGluZVN0eWxlKDQsIDB4MDAwMDAwLCAxKTtcbiAgbGluZS5tb3ZlVG8oMTIqaW1nU2l6ZUFjdHVhbC9pbWdTY2FsZSwgMClcbiAgbGluZS5saW5lVG8oMTIqaW1nU2l6ZUFjdHVhbC9pbWdTY2FsZSwgMTIqaW1nU2l6ZUFjdHVhbC9pbWdTY2FsZSlcblxuICBzdGFnZS5hZGRDaGlsZChsaW5lKVxufVxuXG5mdW5jdGlvbiBidWlsZFRpbGVzKCkge1xuICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBjb2xzOyBjb2wgKyspe1xuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHJvd3M7IHJvdyArKyl7XG4gICAgICB2YXIgdGlsZVNyYyA9ICcvaW1nL3RpbGVzLycgKyBib2FyZEFycltjb2xdW3Jvd10gKyAnLmpwZyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8xNTB4MTUwIGlzIHRoZSBhY3R1YWwgaW1hZ2Ugc2l6ZVxuICAgICAgdmFyIHRpbGUgPSBuZXcgUElYSS5leHRyYXMuVGlsaW5nU3ByaXRlLmZyb21JbWFnZSh0aWxlU3JjLCBpbWdTaXplQWN0dWFsLCBpbWdTaXplQWN0dWFsKVxuICAgICAgXG4gICAgICB0aWxlLnBvc2l0aW9uLnggPSBpbWdTaXplKnJvd1xuICAgICAgdGlsZS5wb3NpdGlvbi55ID0gaW1nU2l6ZSpjb2xzIC0gaW1nU2l6ZSAtIGltZ1NpemUgKiBjb2w7XG4gICAgICAvL3Jlc2NhbGVzIHRoZSAxNTBweCB0aWxlIGltYWdlIHRvIGJlIDQgdGltZXMgc21hbGxlciBcbiAgICAgIHRpbGUuc2NhbGUuc2V0KDEvaW1nU2NhbGUsIDEvaW1nU2NhbGUpO1xuXG4gICAgICBzdGFnZS5hZGRDaGlsZCh0aWxlKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZE1hcCgpe1xuICBjcmVhdGVCb2FyZEFycigpO1xuICBidWlsZFRpbGVzKCk7XG4gIGRyYXdEb2NrTGluZSgpO1xufVxuXG5cbmZ1bmN0aW9uIGluaXQoKXtcbiAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcbn1cblxuYnVpbGRNYXAoKTtcbiIsImFwcC5jb250cm9sbGVyKCdHYW1lQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCB0aGVHYW1lKXtcblxuXHQvLyB3aW5kb3cuc3RhcnQoKVxuICAkc2NvcGUuZ2FtZSA9IHRoZUdhbWU7ICBcblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWUnLCB7XG4gICAgICB1cmw6ICcvZ2FtZS86Z2FtZUlkJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2dhbWUvZ2FtZS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdHYW1lQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRoZUdhbWU6IGZ1bmN0aW9uKEdhbWVGYWN0b3J5LCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICByZXR1cm4gR2FtZUZhY3RvcnkuZ2V0R2FtZSgkc3RhdGVQYXJhbXMuZ2FtZUlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJ1xuICAgIH0pO1xufSk7IiwiYXBwLmNvbnRyb2xsZXIoXCJMb2JieUNvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHNjb3BlLCBGaXJlYmFzZUZhY3RvcnkpIHtcblxuXHRcblx0XG5cdHZhciB0ZXN0a2V5ID0gJzEyMzQnXG5cblx0JHNjb3BlLmxvY2FsQ29ubmVjdGlvbiA9IEZpcmViYXNlRmFjdG9yeS5nZXRDb25uZWN0aW9uKHRlc3RrZXkgKyAnL2dhbWUnKVxuXG5cdCRzY29wZS5nYW1lcyA9IFtcImdhbWUxXCIsIFwiZ2FtZTJcIiwgXCJnYW1lM1wiLCBcImdhbWU0XCJdXG5cblx0JHNjb3BlLmluZm8gPSBbJ2dhbWUxIGluZm8nLCAnZ2FtZTIgaW5mbycsICdnYW1lMyBpbmZvJywgJ2dhbWU0IGluZm8nXVxuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpe1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9iYnknLCB7XG5cdFx0dXJsOiAnL2xvYmJ5Jyxcblx0XHRjb250cm9sbGVyOiAnTG9iYnlDb250cm9sbGVyJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2xvYmJ5L2xvYmJ5Lmh0bWwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGJvYXJkczogZnVuY3Rpb24oQm9hcmRGYWN0b3J5KSB7XG5cdFx0XHRcdHJldHVybiBCb2FyZEZhY3RvcnkuZ2V0QWxsQm9hcmRzKClcblx0XHRcdH1cblx0XHR9XG5cdH0pXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgJHNjb3BlLmxvZ2luID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICRzY29wZS5zZW5kTG9naW4gPSBmdW5jdGlvbiAobG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICAgICBBdXRoU2VydmljZS5sb2dpbihsb2dpbkluZm8pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXG4gICAgICAgIHRlbXBsYXRlOiAnPGltZyBuZy1yZXBlYXQ9XCJpdGVtIGluIHN0YXNoXCIgd2lkdGg9XCIzMDBcIiBuZy1zcmM9XCJ7eyBpdGVtIH19XCIgLz4nLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGFzaCA9IHN0YXNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGF0YS5hdXRoZW50aWNhdGUgaXMgcmVhZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnU2VjcmV0U3Rhc2gnLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3NlY3JldC1zdGFzaCcpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0YXNoOiBnZXRTdGFzaFxuICAgIH07XG5cbn0pOyIsImFwcC5mYWN0b3J5KCdCb2FyZEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG5cdHJldHVybiB7XG5cdFx0Z2V0QWxsQm9hcmRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvYm9hcmQvJylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmRhdGEpXG5cdFx0fSxcblx0XHRnZXRPbmVCb2FyZDogZnVuY3Rpb24oYm9hcmRJZCkge1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9ib2FyZC8nICsgYm9hcmRJZClcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmRhdGEpXG5cdFx0fVxuXHR9XG59KSIsImFwcC5mYWN0b3J5KCdGaXJlYmFzZUZhY3RvcnknLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QpIHtcblxuXHR2YXIgRmlyZWJhc2VGYWN0b3J5ID0ge307XG5cblx0dmFyIGJhc2VVcmwgPSBcImh0dHBzOi8vcmVzcGxlbmRlbnQtdG9yY2gtNDMyMi5maXJlYmFzZWlvLmNvbS9cIjtcblxuXHRGaXJlYmFzZUZhY3RvcnkuZ2V0Q29ubmVjdGlvbiA9IGZ1bmN0aW9uKGtleSkge1xuXHRcdHZhciBsb2NhbENvbm5lY3Rpb24gPSAkZmlyZWJhc2VPYmplY3QobmV3IEZpcmViYXNlKGJhc2VVcmwgKyBrZXkpKVxuXHRcdHJldHVybiBsb2NhbENvbm5lY3Rpb25cblx0fVxuXG5cdHJldHVybiBGaXJlYmFzZUZhY3RvcnlcblxufSkiLCJhcHAuZmFjdG9yeSgnRnVsbHN0YWNrUGljcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0UtVDc1bFdBQUFtcXFKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0V2WkFnLVZBQUFrOTMyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VnTk1lT1hJQUlmRGhLLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VReUlETldnQUF1NjBCLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0NGM1Q1UVc4QUUybEdKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FlVnc1U1dvQUFBTHNqLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FhSklQN1VrQUFsSUdzLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FRT3c5bFdFQUFZOUZsLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1PUWJWckNNQUFOd0lNLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjliX2Vyd0NZQUF3UmNKLnBuZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjVQVGR2bkNjQUVBbDR4LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjRxd0MwaUNZQUFsUEdoLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjJiMzN2UklVQUE5bzFELmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQndwSXdyMUlVQUF2TzJfLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQnNTc2VBTkNZQUVPaEx3LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0o0dkxmdVV3QUFkYTRMLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0k3d3pqRVZFQUFPUHBTLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lkSHZUMlVzQUFubkhWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0dDaVBfWVdZQUFvNzVWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lTNEpQSVdJQUkzN3F1LmpwZzpsYXJnZSdcbiAgICBdO1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnR2FtZUZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG5cdFxuXHR2YXIgR2FtZUZhY3RvcnkgPSB7fTtcblxuXHRHYW1lRmFjdG9yeS5nZXRHYW1lID0gZnVuY3Rpb24oZ2FtZUlkKXtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2dhbWUvJyArIGdhbWVJZClcblx0XHQudGhlbihmdW5jdGlvbihyZXMpe1xuXHRcdCAgXHRyZXR1cm4gcmVzLmRhdGE7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gR2FtZUZhY3Rvcnk7XG59KSIsImFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxuICAgICAgICAnQXQgbG9uZyBsYXN0LCBJIGxpdmUhJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciBwcm9qZWN0LCBleGNlcHQgdGhhdCBJIGFtIHlvdXJzLiA6KScsXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJyxcbiAgICAgICAgJ+OBk+OCk+OBq+OBoeOBr+OAgeODpuODvOOCtuODvOanmOOAgicsXG4gICAgICAgICdXZWxjb21lLiBUby4gV0VCU0lURS4nLFxuICAgICAgICAnOkQnLFxuICAgICAgICAnWWVzLCBJIHRoaW5rIHdlXFwndmUgbWV0IGJlZm9yZS4nLFxuICAgICAgICAnR2ltbWUgMyBtaW5zLi4uIEkganVzdCBncmFiYmVkIHRoaXMgcmVhbGx5IGRvcGUgZnJpdHRhdGEnLFxuICAgICAgICAnSWYgQ29vcGVyIGNvdWxkIG9mZmVyIG9ubHkgb25lIHBpZWNlIG9mIGFkdmljZSwgaXQgd291bGQgYmUgdG8gbmV2U1FVSVJSRUwhJyxcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXG4gICAgICAgIGdldFJhbmRvbUdyZWV0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTtcbiIsImFwcC5kaXJlY3RpdmUoJ2JvYXJkJywgZnVuY3Rpb24gKCkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvZ2FtZS9ib2FyZC9ib2FyZC5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgXHRnYW1lOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgXHR3aW5kb3cuc3RhcnQoKVxuICAgICAgICAvLyBcdHZhciBib2FyZCA9IHtcblx0ICAgICAgIC8vICAgIGNvbDA6IFsxLCAxMywgNSwgMTEsIDUsIDEsIDEsIDUsIDEzLCA1LCAxLCAzMCwgMSwgMSwgMSwgMV0sXG5cdCAgICAgICAvLyAgICBjb2wxOiBbNCwgMTAwLCAxLCAxMSwgMSwgMSwgMSwgOTAsIDEzLCAxLCA1MiwgMiwgMSwgMSwgNSwgMV0sXG5cdCAgICAgICAvLyAgICBjb2wyOiBbMiwgMTMsIDM2LCAxMSwgMSwgNjAsIDEsIDEsIDEzLCA2MCwgMSwgMSwgMiwgMSwgMSwgNF0sIFxuXHQgICAgICAgLy8gICAgY29sMzogWzEsIDEzLCA0LCAxLCA0MCwgNDEsIDk2LCAxLCA0MSwgMTAsIDEwLCAxMCwgMSwgMSwgNSwgMV0sIFxuXHQgICAgICAgLy8gICAgY29sNDogWzIsIDEzLCA5MywgNzEsIDEsIDEsIDEzLCAxLCAxLCA1MCwgMSwgNCwgMiwgMSwgMSwgNF0sXG5cdCAgICAgICAvLyAgICBjb2w1OiBbMTIsIDE1LCA0MSwgNzEsIDEsIDEsIDEzLCA2MCwgOTMsIDEsIDUsIDEsIDEsIDEsIDUsIDFdLFxuXHQgICAgICAgLy8gICAgY29sNjogWzEwLCAxMCwgNDAsIDcxLCAxLCAzNiwgMjIsIDEwLCA0MCwgMTAsIDEwLCAxMCwgMSwgMSwgNSwgMV0sXG5cdCAgICAgICAvLyAgICBjb2w3OiBbMiwgMSwgMSwgNzEsIDEsIDEyLCA0MSwgMSwgMywgMzYsIDEsIDQsIDIsIDEsIDUsIDRdLFxuXHQgICAgICAgLy8gICAgY29sODogWzEsIDEsIDEsIDcxLCAxLCA4LCAxMSwgMSwgMSwgNjAsIDEsIDEsIDEsIDEsIDEsIDFdLFxuXHQgICAgICAgLy8gICAgY29sOTogWzIsIDEsIDMsIDg3LCA3MCwgNzQsIDExLCAxLCAxMywgMTMsIDEsIDUxLCAyLCAxLCA1LCA0XSxcblx0ICAgICAgIC8vICAgIGNvbDEwOiBbMSwgNjAsIDQsIDcxLCAxLCA4OCwgMTEsIDEsIDEzLCAxOSwgMTAsIDEwLCAxLCAxLCAxLCAxXSxcblx0ICAgICAgIC8vICAgIGNvbDExOiBbMzAsIDEsIDMsIDcxLCAzLCA3MywgMTEsIDUzLCA3MywgMywgMSwgMSwgMSwgMSwgNSwgMV1cbiAgICAgIFx0XHQvLyB9XG4gICAgICAgIFx0aW5pdCgpXG4gICAgICAgIH1cbiAgICB9XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ2Z1bGxzdGFja0xvZ28nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5odG1sJ1xuICAgIH07XG59KTsiLCJhcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIEFVVEhfRVZFTlRTLCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0hvbWUnLCBzdGF0ZTogJ2hvbWUnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0Fib3V0Jywgc3RhdGU6ICdsb2JieScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnRG9jdW1lbnRhdGlvbicsIHN0YXRlOiAnZG9jcycgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnTWVtYmVycyBPbmx5Jywgc3RhdGU6ICdtZW1iZXJzT25seScsIGF1dGg6IHRydWUgfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
