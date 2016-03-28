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
app.controller("WaitingRoomController", function ($scope, game, $stateParams, PlayerFactory, FirebaseFactory) {

    $scope.gameID = $stateParams.id;

    var localGamePlayers = FirebaseFactory.getConnection($scope.gameID + '/game' + '/players');
    $scope.players = localGamePlayers;

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
app.factory('FirebaseFactory', function ($firebaseArray) {

    var FirebaseFactory = {};

    var baseUrl = "https://resplendent-torch-4322.firebaseio.com/";
    var baseConnection = $firebaseArray(new Firebase(baseUrl));

    FirebaseFactory.getConnection = function (key) {
        var localConnection = $firebaseArray(new Firebase(baseUrl + key));
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
app.controller('CtrlPanelCtrl', function ($scope) {
    // $scope.register
    // $scope.clickedCard = function(card){

    // }

});
var programCards = [{ name: 'u', priority: 10 }, { name: 'u', priority: 20 }, { name: 'u', priority: 30 }, { name: 'u', priority: 40 }, { name: 'u', priority: 50 }, { name: 'u', priority: 60 }, { name: 'l', priority: 70 }, { name: 'r', priority: 80 }, { name: 'l', priority: 90 }, { name: 'r', priority: 100 }, { name: 'l', priority: 110 }, { name: 'r', priority: 120 }, { name: 'l', priority: 130 }, { name: 'r', priority: 140 }, { name: 'l', priority: 150 }, { name: 'r', priority: 160 }, { name: 'l', priority: 170 }, { name: 'r', priority: 180 }, { name: 'l', priority: 190 }, { name: 'r', priority: 200 }, { name: 'l', priority: 210 }, { name: 'r', priority: 220 }, { name: 'l', priority: 230 }, { name: 'r', priority: 240 }, { name: 'l', priority: 250 }, { name: 'r', priority: 260 }, { name: 'l', priority: 270 }, { name: 'r', priority: 280 }, { name: 'l', priority: 290 }, { name: 'r', priority: 300 }, { name: 'l', priority: 310 }, { name: 'r', priority: 320 }, { name: 'l', priority: 330 }, { name: 'r', priority: 340 }, { name: 'l', priority: 350 }, { name: 'r', priority: 360 }, { name: 'l', priority: 370 }, { name: 'r', priority: 380 }, { name: 'l', priority: 390 }, { name: 'r', priority: 400 }, { name: 'l', priority: 410 }, { name: 'r', priority: 420 }, { name: 'backup', priority: 430 }, { name: 'backup', priority: 440 }, { name: 'backup', priority: 450 }, { name: 'backup', priority: 460 }, { name: 'backup', priority: 470 }, { name: 'backup', priority: 480 }, { name: 'f1', priority: 490 }, { name: 'f1', priority: 500 }, { name: 'f1', priority: 510 }, { name: 'f1', priority: 520 }, { name: 'f1', priority: 530 }, { name: 'f1', priority: 540 }, { name: 'f1', priority: 550 }, { name: 'f1', priority: 560 }, { name: 'f1', priority: 570 }, { name: 'f1', priority: 580 }, { name: 'f1', priority: 590 }, { name: 'f1', priority: 600 }, { name: 'f1', priority: 610 }, { name: 'f1', priority: 620 }, { name: 'f1', priority: 630 }, { name: 'f1', priority: 640 }, { name: 'f1', priority: 650 }, { name: 'f1', priority: 660 }, { name: 'f2', priority: 670 }, { name: 'f2', priority: 680 }, { name: 'f2', priority: 690 }, { name: 'f2', priority: 700 }, { name: 'f2', priority: 710 }, { name: 'f2', priority: 720 }, { name: 'f2', priority: 730 }, { name: 'f2', priority: 740 }, { name: 'f2', priority: 750 }, { name: 'f2', priority: 760 }, { name: 'f2', priority: 770 }, { name: 'f2', priority: 780 }, { name: 'f2', priority: 790 }, { name: 'f3', priority: 800 }, { name: 'f3', priority: 810 }, { name: 'f3', priority: 820 }, { name: 'f3', priority: 830 }, { name: 'f3', priority: 840 }];

app.directive('ctrlpanel', function () {

    return {
        restrict: 'E',
        templateUrl: '/js/game/ctrlPanel/ctrlpanel.html',
        scope: {
            game: '='
        },
        // controller: 'CtrlPanelCtrl',
        link: function link(scope) {
            function chop(arr) {
                var cards = arr.map(function (c) {
                    return programCards[c / 10 - 1];
                });
                var chopped = [];
                var subArr = [];
                for (var i = 0; i < arr.length; i++) {
                    subArr.push(programCards[arr[i] / 10 - 1]);
                    if (subArr.length === 3) {
                        chopped.push(subArr);
                        subArr = [];
                    }
                }
                console.log(chopped);
                return chopped;
            }

            scope.cards = chop([100, 340, 720, 10, 200, 820, 700, 530, 610]);
        }
    };
});

app.directive('draggable', function () {
    return function (scope, element) {
        var el = element[0];
        el.draggable = true;

        el.addEventListener('dragstart', function (ev) {
            ev.dataTransfer.effectAllowed = 'move';
            ev.dataTransfer.setData('Text', el.attributes['carddata'].value);
            this.classList.add('drag');
            return false;
        }, false);

        // el.addEventListener('dragend', function(ev){
        //   this.classList.remove('drag');
        //   return false;
        // }, false);
    };
});

app.directive('droppable', function () {
    return {
        scope: {},
        link: function link(scope, element) {
            var el = element[0];

            el.addEventListener('dragover', function (ev) {
                ev.dataTransfer.dropEffect = 'move';
                if (ev.preventDefault) ev.preventDefault();
                this.classList.add('over');
                return false;
            }, false);

            el.addEventListener('dragenter', function (ev) {
                this.classList.add('over');
                return false;
            }, false);

            el.addEventListener('dragleave', function (ev) {
                this.classList.remove('over');
                return false;
            }, false);

            el.addEventListener('drop', function (ev) {
                if (ev.stopPropagation) ev.stopPropagation();
                this.classList.remove('over');

                var cardId = ev.dataTransfer.getData('Text');
                this.carddata = cardId;

                //add image to register
                var item = document.createElement('img');
                item.src = "/img/cards/" + programCards[cardId / 10 - 1].name + ".png";
                item.height = 100;
                item.width = 70;
                this.appendChild(item);

                var handCard = document.querySelectorAll('[carddata="' + cardId + '"]')[0];
                handCard.classList.add('empty-card');
                handCard.removeAttribute('carddata');
                handCard.removeChild(handCard.childNodes[0]);

                return false;
            }, false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiY3JlYXRlZ2FtZS9jcmVhdGVnYW1lLmNvbnRyb2xsZXIuanMiLCJjcmVhdGVnYW1lL2NyZWF0ZWdhbWUuc3RhdGUuanMiLCJkb2NzL2RvY3MuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImdhbWUvZ2FtZS5jb250cm9sbGVyLmpzIiwiZ2FtZS9nYW1lLnN0YXRlLmpzIiwiaG9tZS9ob21lLmpzIiwibG9iYnkvbG9iYnkuY29udHJvbGxlci5qcyIsImxvYmJ5L2xvYmJ5LnN0YXRlLmpzIiwibG9naW4vbG9naW4uanMiLCJtZW1iZXJzLW9ubHkvbWVtYmVycy1vbmx5LmpzIiwid2FpdGluZ3Jvb20vd2FpdGluZ3Jvb20uY29udHJvbGxlci5qcyIsIndhaXRpbmdyb29tL3dhaXRpbmdyb29tLnN0YXRlLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9Cb2FyZEZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL0ZpcmViYXNlRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRnVsbHN0YWNrUGljcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvR2FtZUZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL1BsYXllckZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL1JhbmRvbUdyZWV0aW5ncy5qcyIsImdhbWUvY3RybHBhbmVsL2N0cmxwYW5lbC5jb250cm9sbGVyLmpzIiwiZ2FtZS9jdHJscGFuZWwvY3RybHBhbmVsLmRpcmVjdGl2ZS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUE7O0FBRUEscUJBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7OztBQUdBLEdBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7O0FBR0EsUUFBQSw0QkFBQSxHQUFBLFNBQUEsNEJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUE7S0FDQSxDQUFBOzs7O0FBSUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7O0FBRUEsWUFBQSxDQUFBLDRCQUFBLENBQUEsT0FBQSxDQUFBLEVBQUE7OztBQUdBLG1CQUFBO1NBQ0E7O0FBRUEsWUFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7OztBQUdBLG1CQUFBO1NBQ0E7OztBQUdBLGFBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7OztBQUlBLGdCQUFBLElBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7YUFDQSxNQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7YUFDQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUNsREEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7O0FBR0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLGlCQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBOzs7QUFHQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNoQkEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLHlCQUFBLEVBQUEsRUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLHdCQUFBLEVBQUEsRUFBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLHlCQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLFdBQUEsQ0FBQSxtQkFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsUUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDYkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxhQUFBO0FBQ0Esa0JBQUEsRUFBQSxzQkFBQTtBQUNBLG1CQUFBLEVBQUEsK0JBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxrQkFBQSxFQUFBLGdCQUFBLFlBQUEsRUFBQTtBQUNBLHVCQUFBLFlBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTthQUNBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNYQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQ0xBLENBQUEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBOzs7O0FBSUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsVUFBQSxLQUFBLElBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7Ozs7O0FBS0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7O0FDcElBLEdBQUEsQ0FBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLElBQUEsR0FBQSxPQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQTs7QUFFQSxhQUFBLGFBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxZQUFBLEdBQUEsR0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsVUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxNQUFBLENBQUE7S0FDQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBOzs7QUFHQSxRQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsU0FBQTtRQUNBLGtCQUFBLEdBQUEsSUFBQSxDQUFBLGtCQUFBO1FBQ0EsTUFBQSxHQUFBLElBQUEsQ0FBQSxNQUFBO1FBQ0EsU0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQTtRQUNBLE1BQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FDQSxHQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsUUFBQSxhQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsUUFBQSxRQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsYUFBQSxHQUFBLFFBQUEsQ0FBQTs7QUFFQSxhQUFBLEtBQUEsR0FBQTs7QUFFQSxZQUFBLEtBQUEsR0FBQSxJQUFBLFNBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxRQUFBLEdBQUEsa0JBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxFQUFBLE9BQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsY0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOzs7QUFJQSxZQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsaUJBQUEsWUFBQSxHQUFBO0FBQ0EsZ0JBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsR0FBQSxhQUFBLEdBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxHQUFBLGFBQUEsR0FBQSxRQUFBLEVBQUEsRUFBQSxHQUFBLGFBQUEsR0FBQSxRQUFBLENBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtTQUNBOztBQUVBLGlCQUFBLFVBQUEsR0FBQTtBQUNBLGlCQUFBLElBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBO0FBQ0EscUJBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEVBQUE7QUFDQSx3QkFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7O0FBRUEsd0JBQUEsSUFBQSxHQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsd0JBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxHQUFBLENBQUE7QUFDQSx3QkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLElBQUEsR0FBQSxPQUFBLEdBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQTs7QUFFQSx3QkFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsUUFBQSxDQUFBLENBQUE7O0FBRUEseUJBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7aUJBQ0E7YUFDQTtTQUNBO0FBQ0EsaUJBQUEsU0FBQSxHQUFBO0FBQ0EsaUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLG9CQUFBLE9BQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLEVBQUEsRUFBQSxJQUFBLEVBQUEsWUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQTs7QUFFQSxpQkFBQSxVQUFBLEdBQUE7QUFDQSxpQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0Esb0JBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0Esb0JBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0Esb0JBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7aUJBQ0EsTUFDQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7aUJBQ0EsTUFDQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLHlCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSx5QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsdUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2lCQUNBLE1BQ0E7QUFDQSx5QkFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EseUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtpQkFDQTs7QUFFQSxvQkFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsT0FBQSxFQUFBLEtBQUEsR0FBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLEVBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxDQUFBOztBQUVBLHFCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBRUE7U0FDQTs7QUFHQSxZQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxDQUFBOztBQUVBLFlBQUEsT0FBQSxHQUFBLENBQ0EsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLENBQ0EsQ0FBQTs7O0FBR0EsWUFBQSxjQUFBLEdBQUEsQ0FDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLENBQ0EsQ0FBQTs7Ozs7Ozs7QUFTQSxZQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsaUJBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLG9CQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsU0FBQSxFQUFBLFlBQUEsRUFBQSxDQUFBOztBQUVBLHlCQUFBLFlBQUEsR0FBQTtBQUNBLHdCQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0Esd0JBQUEsS0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx5QkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx5QkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx5QkFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsUUFBQSxDQUFBLENBQUE7O0FBRUEseUJBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSw2QkFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSw2QkFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLDRCQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBOztpQkFFQTthQUNBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtTQUNBOztBQUVBLGlCQUFBLFFBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLEdBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7OztBQUdBLDJCQUFBLEVBQUEsQ0FBQTs7QUFFQSx5QkFBQSxXQUFBLEdBQUE7QUFDQSw2QkFBQSxFQUFBLENBQUE7QUFDQSw2QkFBQSxFQUFBLENBQUE7aUJBQ0E7O0FBRUEseUJBQUEsU0FBQSxHQUFBO0FBQ0Esd0JBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQTt3QkFBQSxLQUFBLENBQUE7OztBQUdBLHdCQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsNEJBQUEsU0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFNBQUEsRUFBQSxDQUFBOztBQUVBLGlDQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxpQ0FBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLCtCQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7OztBQUdBLGlDQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBOztBQUVBLDZCQUFBLENBQUEsUUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO3FCQUVBOzs7QUFHQSw0QkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtpQkFDQTs7QUFFQSx5QkFBQSxTQUFBLEdBQUE7QUFDQSx3QkFBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsSUFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLDZDQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSw2QkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0NBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7cUJBQ0E7aUJBQ0E7YUFDQSxDQUFBLENBQUE7U0FDQTs7QUFHQSxrQkFBQSxFQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUE7QUFDQSxvQkFBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTs7O0FBR0EsaUJBQUEsUUFBQSxHQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxpQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxZQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUE7O0FBRUEsb0JBQUEsRUFBQSxDQUFBO1NBQ0E7S0FDQTtDQUdBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLFVBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxXQUFBLFNBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQTtDQUNBOzs7Ozs7Ozs7O0FDNU9BLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGVBQUE7QUFDQSxtQkFBQSxFQUFBLG9CQUFBO0FBQ0Esa0JBQUEsRUFBQSxVQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSxpQkFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBO0FBQ0EsdUJBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7YUFDQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNaQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0xBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxlQUFBLEVBQUE7O0FBRUEsUUFBQSxPQUFBLEdBQUEsMEJBQUEsQ0FBQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLFFBQUEsQ0FBQTs7Q0FHQSxDQUFBLENBQUE7QUNSQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLGlCQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGVBQUEsRUFBQTtBQUNBLGtCQUFBLEVBQUEsZ0JBQUEsWUFBQSxFQUFBO0FBQ0EsdUJBQUEsWUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ1hBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0FBQ0Esa0JBQUEsRUFBQSxXQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLFNBQUEsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLEdBQUEsNEJBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMzQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsZUFBQTtBQUNBLGdCQUFBLEVBQUEsbUVBQUE7QUFDQSxrQkFBQSxFQUFBLG9CQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSx1QkFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBOzs7QUFHQSxZQUFBLEVBQUE7QUFDQSx3QkFBQSxFQUFBLElBQUE7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxTQUFBLFFBQUEsR0FBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsUUFBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMvQkEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx1QkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBLGVBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsTUFBQSxHQUFBLFlBQUEsQ0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxnQkFBQSxHQUFBLGVBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsR0FBQSxPQUFBLEdBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxHQUFBLGdCQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSx5QkFBQSxFQUFBLEVBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSx3QkFBQSxFQUFBLEVBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSx5QkFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsYUFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7O1NBRUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ2pCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGtCQUFBO0FBQ0EsbUJBQUEsRUFBQSxpQ0FBQTtBQUNBLGtCQUFBLEVBQUEsdUJBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLGNBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNaQSxHQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFdBQUE7QUFDQSxvQkFBQSxFQUFBLHdCQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBO3VCQUFBLFFBQUEsQ0FBQSxJQUFBO2FBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxtQkFBQSxFQUFBLHFCQUFBLE9BQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxHQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUE7dUJBQUEsUUFBQSxDQUFBLElBQUE7YUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNYQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsUUFBQSxlQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBLGdEQUFBLENBQUE7QUFDQSxRQUFBLGNBQUEsR0FBQSxjQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLGFBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsZUFBQSxHQUFBLGNBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsZUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxjQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUEsZUFBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDbEJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLENBQ0EsdURBQUEsRUFDQSxxSEFBQSxFQUNBLGlEQUFBLEVBQ0EsaURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxDQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDN0JBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxlQUFBLENBQUEsbUJBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNuQkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxhQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQSxhQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNiQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTs7QUFFQSxRQUFBLGtCQUFBLEdBQUEsU0FBQSxrQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLFNBQUEsR0FBQSxDQUNBLGVBQUEsRUFDQSx1QkFBQSxFQUNBLHNCQUFBLEVBQ0EsdUJBQUEsRUFDQSx5REFBQSxFQUNBLDBDQUFBLEVBQ0EsY0FBQSxFQUNBLHVCQUFBLEVBQ0EsSUFBQSxFQUNBLGlDQUFBLEVBQ0EsMERBQUEsRUFDQSw2RUFBQSxDQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGlCQUFBLEVBQUEsU0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxrQkFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNUJBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBOzs7Ozs7Q0FNQSxDQUFBLENBQUE7QUNOQSxJQUFBLFlBQUEsR0FBQSxDQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsRUFBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxFQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEVBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsRUFBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxFQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEVBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsRUFBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxFQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEVBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxXQUFBLEVBQUEsWUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQ0FBQTtBQUNBLGFBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtTQUNBOztBQUVBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQTtBQUNBLHFCQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLDJCQUFBLFlBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxvQkFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EscUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsMEJBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHdCQUFBLE1BQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsK0JBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSw4QkFBQSxHQUFBLEVBQUEsQ0FBQTtxQkFDQTtpQkFDQTtBQUNBLHVCQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsT0FBQSxDQUFBO2FBQ0E7O0FBRUEsaUJBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxHQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxnQkFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxZQUFBLENBQUEsYUFBQSxHQUFBLE1BQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBO1NBQ0EsRUFBQSxLQUFBLENBQUEsQ0FBQTs7Ozs7O0tBTUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsU0FBQSxDQUFBLFdBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLGFBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsY0FBQSxDQUFBLGdCQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxHQUFBLE1BQUEsQ0FBQTtBQUNBLG9CQUFBLEVBQUEsQ0FBQSxjQUFBLEVBQUEsRUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsS0FBQSxDQUFBO2FBQ0EsRUFBQSxLQUFBLENBQUEsQ0FBQTs7QUFFQSxjQUFBLENBQUEsZ0JBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxvQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxLQUFBLENBQUE7YUFDQSxFQUFBLEtBQUEsQ0FBQSxDQUFBOztBQUVBLGNBQUEsQ0FBQSxnQkFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLG9CQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLEtBQUEsQ0FBQTthQUNBLEVBQUEsS0FBQSxDQUFBLENBQUE7O0FBRUEsY0FBQSxDQUFBLGdCQUFBLENBQUEsTUFBQSxFQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0Esb0JBQUEsRUFBQSxDQUFBLGVBQUEsRUFBQSxFQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7O0FBRUEsb0JBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBOzs7QUFHQSxvQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLGFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsR0FBQSxHQUFBLGFBQUEsR0FBQSxZQUFBLENBQUEsTUFBQSxHQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRUEsb0JBQUEsUUFBQSxHQUFBLFFBQUEsQ0FBQSxnQkFBQSxDQUFBLGFBQUEsR0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx3QkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSx3QkFBQSxDQUFBLGVBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLHdCQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSx1QkFBQSxLQUFBLENBQUE7YUFDQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDekxBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLHlDQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBOztBQUVBLGlCQUFBLENBQUEsS0FBQSxHQUFBLENBQ0EsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsY0FBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSwyQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsMEJBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSwyQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLHlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsbUJBQUEsRUFBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtTQUVBOztLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZScsICdmaXJlYmFzZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgICAgdXJsOiAnL2Fib3V0JyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0Q29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYWJvdXQvYWJvdXQuaHRtbCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBYm91dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBGdWxsc3RhY2tQaWNzKSB7XG5cbiAgICAvLyBJbWFnZXMgb2YgYmVhdXRpZnVsIEZ1bGxzdGFjayBwZW9wbGUuXG4gICAgJHNjb3BlLmltYWdlcyA9IF8uc2h1ZmZsZShGdWxsc3RhY2tQaWNzKTtcblxufSk7IiwiYXBwLmNvbnRyb2xsZXIoXCJDcmVhdGVHYW1lQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsIGJvYXJkcywgR2FtZUZhY3RvcnksICRzdGF0ZSkge1xuXG5cdCRzY29wZS5ib2FyZHMgPSBib2FyZHNcblxuXHQkc2NvcGUucm9ib3RzID0gW3tuYW1lOiBcIlNwaW4gQm90XCIsIGltZ1VybDogXCIvaW1nL3JvYm90cy9zcGluYm90LmpwZ1wifSwge25hbWU6IFwiVHdvbmt5XCIsIGltZ1VybDogXCIvaW1nL3JvYm90cy90d29ua3kuanBnXCJ9LCB7bmFtZTogXCJab29tIEJvdFwiLCBpbWdVcmw6IFwiL2ltZy9yb2JvdHMvem9vbWJvdC5qcGdcIn1dXG5cblx0JHNjb3BlLkNyZWF0ZUdhbWUgPSBmdW5jdGlvbihnYW1lKSB7XG5cdFx0cmV0dXJuIEdhbWVGYWN0b3J5LmNyZWF0ZVBsYXllckFuZEdhbWUoZ2FtZSlcblx0XHQudGhlbihmdW5jdGlvbihnYW1lSW5mbykge1xuXHRcdFx0Y29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHJlc3BvbnNlJywgZ2FtZUluZm8pXG5cdFx0XHQkc3RhdGUuZ28oJ3dhaXRpbmdyb29tJywge2lkOiBnYW1lSW5mby5faWR9KVxuXHRcdH0pXG5cdH1cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjcmVhdGVnYW1lJywge1xuXHRcdHVybDogJy9jcmVhdGVnYW1lJyxcblx0XHRjb250cm9sbGVyOiAnQ3JlYXRlR2FtZUNvbnRyb2xsZXInLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvY3JlYXRlZ2FtZS9jcmVhdGVnYW1lLmh0bWwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGJvYXJkczogZnVuY3Rpb24oQm9hcmRGYWN0b3J5KSB7XG5cdFx0XHRcdHJldHVybiBCb2FyZEZhY3RvcnkuZ2V0QWxsQm9hcmRzKClcblx0XHRcdH1cblx0XHR9XG5cdH0pXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2RvY3MnLCB7XG4gICAgICAgIHVybDogJy9kb2NzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kb2NzL2RvY3MuaHRtbCdcbiAgICB9KTtcbn0pO1xuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ1NvY2tldCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbiAoJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbiAoZnJvbVNlcnZlcikge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcbiAgICAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7XG4iLCJhcHAuY29udHJvbGxlcignR2FtZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgdGhlR2FtZSl7XG5cblx0JHNjb3BlLmdhbWUgPSB0aGVHYW1lO1xuXHQkc2NvcGUuYm9hcmRPYmogPSAkc2NvcGUuZ2FtZS5ib2FyZFxuXHQkc2NvcGUuZG9ja3MgPSAkc2NvcGUuZ2FtZS5ib2FyZC5kb2NrTG9jYXRpb25zXG5cdCRzY29wZS5sYXNlcnMgPSAkc2NvcGUuZ2FtZS5ib2FyZC5sYXNlckxvY2F0aW9uc1xuXHQvLyBjb25zb2xlLmxvZygkc2NvcGUubGFzZXJzKVxuXHRmdW5jdGlvbiBjb2xsZWN0T25lQ29sKG4pe1xuXHR2YXIga2V5ID0gJ2NvbCcgKyBuLnRvU3RyaW5nKCk7XG5cdHZhciBpZGVudHMgPSAkc2NvcGUuYm9hcmRPYmpba2V5XS5tYXAoZnVuY3Rpb24odGlsZSl7XG5cdCAgcmV0dXJuIHRpbGUuaWRlbnRpZmllcjtcblx0fSk7XG5cdHJldHVybiBpZGVudHM7XG5cdH1cblxuXHQkc2NvcGUuYm9hcmQgPSBbXTtcblx0Zm9yKHZhciBpID0gMDsgaSA8PSAxMTsgaSArKyl7XG5cdFx0JHNjb3BlLmJvYXJkLnB1c2goY29sbGVjdE9uZUNvbChpKSk7XG5cdH1cblx0Ly8gY29uc29sZS5sb2coJHNjb3BlLmRvY2tzKVxuXG5cdHZhciBDb250YWluZXIgPSBQSVhJLkNvbnRhaW5lcixcbiAgICBhdXRvRGV0ZWN0UmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcixcbiAgICBsb2FkZXIgPSBQSVhJLmxvYWRlcixcbiAgICByZXNvdXJjZXMgPSBQSVhJLmxvYWRlci5yZXNvdXJjZXMsXG4gICAgU3ByaXRlID0gUElYSS5TcHJpdGU7XG5cblx0bG9hZGVyXG4gIFx0LmFkZChcImltZy9zcHJpdGVzaGVldC5qc29uXCIpXG4gIFx0LmxvYWQoc2V0dXApO1xuXG4gIFx0dmFyIGlkID0gUElYSS5sb2FkZXIucmVzb3VyY2VzW1wiaW1nL3Nwcml0ZXNoZWV0Lmpzb25cIl0udGV4dHVyZXM7IFxuICAgIHZhciBpbWdTaXplQWN0dWFsID0gMTUwIFxuXHR2YXIgaW1nU2NhbGUgPSA0XG5cdHZhciBpbWdTaXplID0gaW1nU2l6ZUFjdHVhbC9pbWdTY2FsZVxuXG5cdGZ1bmN0aW9uIHNldHVwKCkge1xuXG5cdCAgICB2YXIgc3RhZ2UgPSBuZXcgQ29udGFpbmVyKCk7XG5cdCAgICB2YXIgcmVuZGVyZXIgPSBhdXRvRGV0ZWN0UmVuZGVyZXIoaW1nU2l6ZSoxNixpbWdTaXplKjEyKTtcblx0ICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmRDb250YWluZXJcIikuYXBwZW5kQ2hpbGQocmVuZGVyZXIudmlldylcblxuXG5cdFx0Ly9mYWN0b3IgdG8gcmVzY2FsZSBpbWFnZXMgYnkuIFRoaXMgbnVtYmVyIGNhbiBiZSBjaGFuZ2VkXG5cdFx0dmFyIGNvbHMgPSAxMjtcblx0XHR2YXIgcm93cyA9IDE2O1xuXG5cdFx0ZnVuY3Rpb24gZHJhd0RvY2tMaW5lKCkge1xuXHRcdCAgdmFyIGxpbmUgPSBuZXcgUElYSS5HcmFwaGljcztcblx0XHQgIGxpbmUubGluZVN0eWxlKDQsIDB4MDAwMDAwLCAxKTtcblx0XHQgIGxpbmUubW92ZVRvKDEyKmltZ1NpemVBY3R1YWwvaW1nU2NhbGUsIDApXG5cdFx0ICBsaW5lLmxpbmVUbygxMippbWdTaXplQWN0dWFsL2ltZ1NjYWxlLCAxMippbWdTaXplQWN0dWFsL2ltZ1NjYWxlKVxuXG5cdFx0ICBzdGFnZS5hZGRDaGlsZChsaW5lKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGJ1aWxkVGlsZXMoKSB7XG5cdFx0ICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBjb2xzOyBjb2wgKyspe1xuXHRcdCAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCByb3dzOyByb3cgKyspe1xuXHRcdCAgICAgIHZhciB0aWxlU3JjID0gJHNjb3BlLmJvYXJkW2NvbF1bcm93XSArICcuanBnJztcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8xNTB4MTUwIGlzIHRoZSBhY3R1YWwgaW1hZ2Ugc2l6ZVxuXHRcdCAgICAgIHZhciB0aWxlID0gbmV3IFNwcml0ZShyZXNvdXJjZXNbXCJpbWcvc3ByaXRlc2hlZXQuanNvblwiXS50ZXh0dXJlc1t0aWxlU3JjXSk7XG5cdFx0ICAgICAgXG5cdFx0ICAgICAgdGlsZS5wb3NpdGlvbi54ID0gaW1nU2l6ZSpyb3dcblx0XHQgICAgICB0aWxlLnBvc2l0aW9uLnkgPSBpbWdTaXplKmNvbHMgLSBpbWdTaXplIC0gaW1nU2l6ZSAqIGNvbDtcblx0XHQgICAgICAvL3Jlc2NhbGVzIHRoZSAxNTBweCB0aWxlIGltYWdlIHRvIGJlIDQgdGltZXMgc21hbGxlciBcblx0XHQgICAgICB0aWxlLnNjYWxlLnNldCgxL2ltZ1NjYWxlLCAxL2ltZ1NjYWxlKTtcblxuXHRcdCAgICAgIHN0YWdlLmFkZENoaWxkKHRpbGUpXG5cdFx0ICAgIH1cblx0XHQgIH1cblx0XHR9XG5cdFx0ZnVuY3Rpb24gZHJhd0RvY2tzKCkge1xuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8ICRzY29wZS5kb2Nrcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgZG9ja051bSA9IGkrMTtcblx0XHRcdFx0dmFyIGRvY2sgPSBuZXcgUElYSS5UZXh0KGRvY2tOdW0udG9TdHJpbmcoKSwge2ZvbnQgOiAnMjRweCBBcmlhbCcsIGZpbGwgOiAweDAwMDAwMCwgYWxpZ24gOiAnY2VudGVyJ30pXG5cdFx0XHRcdGRvY2sucG9zaXRpb24ueCA9ICRzY29wZS5kb2Nrc1tpXVswXSppbWdTaXplICsgMTM7XG5cdFx0XHRcdGRvY2sucG9zaXRpb24ueSA9ICRzY29wZS5kb2Nrc1tpXVsxXSppbWdTaXplICsgNTtcblx0XHRcdFx0c3RhZ2UuYWRkQ2hpbGQoZG9jayk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZHJhd0xhc2VycygpIHtcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCAkc2NvcGUubGFzZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBsaW5lID0gbmV3IFBJWEkuR3JhcGhpY3M7XG5cdFx0XHRcdHZhciB4RnJvbSwgeUZyb20sIHhUbywgeVRvO1xuXHRcdFx0XHRpZigkc2NvcGUubGFzZXJzW2ldWzNdID09PSBcImhcIiAmJiAkc2NvcGUubGFzZXJzW2ldWzBdWzBdID4gJHNjb3BlLmxhc2Vyc1tpXVtpXVsxXVswXSkge1xuXHRcdFx0XHRcdHhGcm9tID0gJHNjb3BlLmxhc2Vyc1tpXVswXVswXSBcblx0XHRcdFx0XHR5RnJvbSA9ICRzY29wZS5sYXNlcnNbaV1bMF1bMV0gKyAwLjVcblx0XHRcdFx0XHR4VG8gPSAkc2NvcGUubGFzZXJzW2ldWzFdWzBdIFxuXHRcdFx0XHRcdHlUbyA9ICRzY29wZS5sYXNlcnNbaV1bMV1bMV0gKyAwLjVcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKCRzY29wZS5sYXNlcnNbaV1bM10gPT09IFwiaFwiKSB7XG5cdFx0XHRcdFx0eEZyb20gPSAkc2NvcGUubGFzZXJzW2ldWzBdWzBdIFxuXHRcdFx0XHRcdHlGcm9tID0gJHNjb3BlLmxhc2Vyc1tpXVswXVsxXSArIDAuNVxuXHRcdFx0XHRcdHhUbyA9ICRzY29wZS5sYXNlcnNbaV1bMV1bMF0gXG5cdFx0XHRcdFx0eVRvID0gJHNjb3BlLmxhc2Vyc1tpXVsxXVsxXSArIDAuNVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYoJHNjb3BlLmxhc2Vyc1tpXVszXSA9PT0gXCJ2XCIgJiYgJHNjb3BlLmxhc2Vyc1tpXVswXVsxXSA+ICRzY29wZS5sYXNlcnNbaV1bMV1bMV0pIHtcblx0XHRcdFx0XHR4RnJvbSA9ICRzY29wZS5sYXNlcnNbaV1bMF1bMF0gKyAwLjVcblx0XHRcdFx0XHR5RnJvbSA9ICRzY29wZS5sYXNlcnNbaV1bMF1bMV0gXG5cdFx0XHRcdFx0eFRvID0gJHNjb3BlLmxhc2Vyc1tpXVsxXVswXSArIDAuNVxuXHRcdFx0XHRcdHlUbyA9ICRzY29wZS5sYXNlcnNbaV1bMV1bMV0gXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0eEZyb20gPSAkc2NvcGUubGFzZXJzW2ldWzBdWzBdICsgMC41XG5cdFx0XHRcdFx0eUZyb20gPSAkc2NvcGUubGFzZXJzW2ldWzBdWzFdIFxuXHRcdFx0XHRcdHhUbyA9ICRzY29wZS5sYXNlcnNbaV1bMV1bMF0gKyAwLjVcblx0XHRcdFx0XHR5VG8gPSAkc2NvcGUubGFzZXJzW2ldWzFdWzFdIFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGluZS5saW5lU3R5bGUoMSwgMHhmZjAwMDApXG5cdFx0XHRcdGxpbmUubW92ZVRvKHhGcm9tKmltZ1NpemUsIHlGcm9tKmltZ1NpemUpXG5cdFx0XHRcdGxpbmUubGluZVRvKHhUbyppbWdTaXplLCB5VG8qaW1nU2l6ZSlcblxuXHRcdFx0XHRzdGFnZS5hZGRDaGlsZChsaW5lKVxuXHRcdFx0ICAgIFxuXHRcdFx0fVxuXHRcdH1cblxuXG5cdFx0dmFyIHBsYXllcjEsIHBsYXllcjIsIHBsYXllcjM7XG5cdFx0Ly9zZWVkIGZvciBvcmlnaW5hbCBsb2NhdGlvblxuXHRcdHZhciBwbGF5ZXJzID0gW1xuXHRcdCAgeyBuYW1lOiBcInBsYXllcjFcIiwgbG9jYXRpb246IFsxNSw1XSwgYmVhcmluZzogWy0xLCAwXSwgcm9ib3Q6IFwiSGFtbWVyIEJvdFwiLCBwcmlvcml0eVZhbDogbnVsbCB9LFxuXHRcdCAgeyBuYW1lOiBcInBsYXllcjJcIiwgbG9jYXRpb246IFsxNSw2XSwgYmVhcmluZzogWy0xLCAwXSwgcm9ib3Q6IFwiU3BpbiBCb3RcIiwgcHJpb3JpdHlWYWw6IG51bGwgfSxcblx0XHQgIHsgbmFtZTogXCJwbGF5ZXIzXCIsIGxvY2F0aW9uOiBbMTQsM10sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcIlR3b25reVwiLCBwcmlvcml0eVZhbDogbnVsbCB9LFxuXHRcdF1cblxuXHRcdC8vc2VlZCBmb3Igc2Vjb25kIGxvY2F0aW9uXG5cdFx0dmFyIHBsYXllckNhcmRNb3ZlID0gW1xuXHRcdCAgeyBuYW1lOiBcInBsYXllcjFcIiwgbG9jYXRpb246IFsxNSw1XSwgYmVhcmluZzogWzAsIDFdLCByb2JvdDogXCJIYW1tZXIgQm90XCIsIHByaW9yaXR5VmFsOiA1MDAgfSxcblx0XHQgIHsgbmFtZTogXCJwbGF5ZXIzXCIsIGxvY2F0aW9uOiBbMTMsM10sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcIlR3b25reVwiLCBwcmlvcml0eVZhbDogODAwIH0sXG5cdFx0ICB7IG5hbWU6IFwicGxheWVyMlwiLCBsb2NhdGlvbjogWzEyLDZdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJTcGluIEJvdFwiLCBwcmlvcml0eVZhbDogMjAwIH0sXG5cdFx0XVxuXG5cdFx0Ly8gdmFyIHBsYXllckJvYXJkTW92ZSA9IFtcblx0XHQvLyBcdHsgbmFtZTogXCJwbGF5ZXIzXCIsIGxvY2F0aW9uOiBbMTIsM10sIGJlYXJpbmc6IFsxLCAwXSwgcm9ib3Q6IFwiVHdvbmt5XCIsIHByaW9yaXR5VmFsOiA4MDAgfSxcblx0XHQvLyBcdHsgbmFtZTogXCJwbGF5ZXIxXCIsIGxvY2F0aW9uOiBbMTQsNV0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcIkhhbW1lciBCb3RcIiwgcHJpb3JpdHlWYWw6IDUwMCB9LFxuXHRcdC8vIFx0eyBuYW1lOiBcInBsYXllcjJcIiwgbG9jYXRpb246IFsxMiwgNl0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcIlNwaW4gQm90XCIsIHByaW9yaXR5VmFsOiAyMDAgfSxcblx0XHQvLyBdXG5cblxuXHRcdHZhciByb2JvdEhhc2ggPSB7fTtcblxuXHRcdGZ1bmN0aW9uIGRyYXdSb2JvdHMoaW5pdGlhbCkge1xuXHRcdFx0aW5pdGlhbC5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllciwgaWR4KXtcblx0XHRcdFx0aWYocm9ib3RIYXNoW3BsYXllci5uYW1lXSA9PT0gdW5kZWZpbmVkKSBjcmVhdGVTcHJpdGUoKTtcblxuXHRcdFx0XHRmdW5jdGlvbiBjcmVhdGVTcHJpdGUoKSB7XG5cdFx0XHRcdFx0dmFyIHJvYm90SW1nID0gcm9ib3RJbWFnZShwbGF5ZXIucm9ib3QpO1xuXHRcdFx0XHRcdHZhciByb2JvdCA9IG5ldyBTcHJpdGUocmVzb3VyY2VzW1wiaW1nL3Nwcml0ZXNoZWV0Lmpzb25cIl0udGV4dHVyZXNbcm9ib3RJbWddKVxuXHRcdFx0XHRcdHJvYm90LnBvc2l0aW9uLnggPSBpbWdTaXplKnBsYXllci5sb2NhdGlvblswXTtcblx0XHRcdCAgICAgICAgcm9ib3QucG9zaXRpb24ueSA9IGltZ1NpemUqcGxheWVyLmxvY2F0aW9uWzFdO1xuXHRcdFx0ICAgICAgICByb2JvdC5zY2FsZS5zZXQoMS9pbWdTY2FsZSwgMS9pbWdTY2FsZSk7XG5cblx0XHRcdCAgICAgIFx0c3RhZ2UuYWRkQ2hpbGQocm9ib3QpO1xuXHRcdFx0ICAgICAgXHRyb2JvdEhhc2hbcGxheWVyLm5hbWVdID0gcm9ib3Q7XG5cdFx0XHQgICAgICBcdHJvYm90SGFzaFtwbGF5ZXIubmFtZV0uYmVhcmluZyA9IHBsYXllci5iZWFyaW5nO1xuXHRcdFx0ICAgICAgXHRyZW5kZXJlci5yZW5kZXIoc3RhZ2UpXG5cdFx0XHQgICAgICBcdC8vIG1vdmVQbGF5ZXIoKTtcblx0XHRcdFx0fVx0XG5cdFx0XHR9KVxuXHRcdFx0XHRjb25zb2xlLmxvZygncm9ib2hhc2gnLCByb2JvdEhhc2gpXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gY2FyZE1vdmUocGxheWVyT2Jqcykge1xuXHRcdFx0cGxheWVyT2Jqcy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcixpZHgpe1xuXHRcdFx0XHR2YXIgcm9ib3QgPSByb2JvdEhhc2hbcGxheWVyLm5hbWVdO1xuXHRcdFx0XHR2YXIgdHVybiA9IGZhbHNlO1xuXHRcdFx0XHQvLyBzZXRUaW1lb3V0KHR1cm5BbmRNb3ZlLmJpbmQobnVsbCwgcGxheWVyKSwgaWR4Ki41ICsgNjAwMClcblxuXHRcdFx0XHR0dXJuQW5kTW92ZSgpXG5cblx0XHRcdFx0ZnVuY3Rpb24gdHVybkFuZE1vdmUoKSB7XG5cdFx0XHRcdFx0dHVyblJvYm90KCk7XG5cdFx0XHRcdFx0bW92ZVJvYm90KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmdW5jdGlvbiB0dXJuUm9ib3QoKSB7XG5cdFx0XHRcdFx0dmFyIHJhZGlhbnMgPSBNYXRoLlBpLzE4MCwgYW5nbGU7XG5cdFx0XHRcdFx0Ly8gcm9ib3QucG9zaXRpb24ueCArPSBpbWdTaXplLzI7XG5cdFx0XHRcdFx0Ly8gcm9ib3QucG9zaXRpb24ueSArPSBpbWdTaXplLzI7XG5cdFx0XHRcdFx0aWYocGxheWVyLmJlYXJpbmdbMF0gKyByb2JvdC5iZWFyaW5nWzBdID09PSAwIHx8IHBsYXllci5iZWFyaW5nWzFdICsgcm9ib3QuYmVhcmluZ1sxXSkge1xuXHRcdFx0XHRcdFx0dmFyIGNvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuXHRcdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ2NvbnRhaW5lcicsIGNvbnRhaW5lcilcblx0XHRcdFx0XHRcdGNvbnRhaW5lci5waXZvdC5zZXQocm9ib3QucG9zaXRpb24ueCArIGltZ1NpemUvMiwgcm9ib3QucG9zaXRpb24ueSArIGltZ1NpemUvMilcblx0XHRcdFx0XHRcdC8vIGNvbnRhaW5lci5hbmNob3Iuc2V0KHJvYm90LnBvc2l0aW9uLnggKyBpbWdTaXplLzIsIHJvYm90LnBvc2l0aW9uLnkgKyBpbWdTaXplLzIpXG5cdFx0XHRcdFx0XHRjb250YWluZXIuYWRkQ2hpbGQocm9ib3QpO1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ2hlcmUnLCBwbGF5ZXIubmFtZSlcblx0XHRcdFx0XHRcdC8vIHJvYm90LmFuY2hvci54ID0gaW1nU2l6ZS8yO1xuXHRcdFx0XHRcdFx0Ly8gcm9ib3QuYW5jaG9yLnkgPSBpbWdTaXplLzI7XG5cdFx0XHRcdFx0XHRjb250YWluZXIucm90YXRpb24gPSBNYXRoLlBJLzJcblxuXHRcdFx0XHRcdFx0c3RhZ2UuYWRkQ2hpbGQoY29udGFpbmVyKVxuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHJvYm90LnBvc2l0aW9uLnggLT1pbWdTaXplLzJcblx0XHRcdFx0XHQvLyByb2JvdC5wb3NpdGlvbi55IC09IGltZ1NpemUvMjtcblx0XHRcdFx0XHRyZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnVuY3Rpb24gbW92ZVJvYm90KCkge1xuXHRcdFx0XHRcdGlmKCF0dXJuICYmIHJvYm90LnBvc2l0aW9uLnggPj0gaW1nU2l6ZSAqIHBsYXllci5sb2NhdGlvblswXSkge1xuXHRcdFx0XHQgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlUm9ib3QpO1xuXHRcdFx0XHQgICAgICAgIHJvYm90LnBvc2l0aW9uLnggLT0gMTtcblx0XHRcdFx0ICAgICAgICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuXHRcdFx0XHQgIFx0fSBcdFx0XG5cdFx0XHRcdH1cdFxuXHRcdFx0fSlcblx0XHR9XG5cblxuXHRcdGJ1aWxkVGlsZXMoKTtcblx0XHRkcmF3RG9ja3MoKTtcblx0XHRkcmF3RG9ja0xpbmUoKTtcblx0XHRkcmF3TGFzZXJzKCk7XG5cdFx0ZHJhd1JvYm90cyhwbGF5ZXJzKTtcblx0XHRjYXJkTW92ZShwbGF5ZXJDYXJkTW92ZSk7XG5cdFx0Ly8gbmV3TG9jYXRpb24ocGxheWVyQm9hcmRNb3ZlKTtcblxuXHRcdGZ1bmN0aW9uIGJ1aWxkTWFwKCl7XG5cdFx0ICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuXHRcdCAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGJ1aWxkTWFwKTtcblx0XHR9XG5cdFx0aWYoJHNjb3BlLmdhbWUpIHtcblxuXHRcdFx0YnVpbGRNYXAoKTtcblx0XHR9XG5cdH1cblxuXG59KTtcblxuZnVuY3Rpb24gcm9ib3RJbWFnZSAocm9ib3ROYW1lKSB7XG5cdHJldHVybiByb2JvdE5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8gL2csJycpICsgJy5wbmcnO1xufVxuXG5cblxuLyogYmVhcmluZ3NcblxuWy0xLDBdIE5cblswLCAxXSBFXG5bMCwgLTFdIFdcblsxLCAwXSBTXG5cbiovIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lJywge1xuICAgICAgdXJsOiAnL2dhbWUvOmdhbWVJZCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9qcy9nYW1lL2dhbWUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnR2FtZUN0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0aGVHYW1lOiBmdW5jdGlvbihHYW1lRmFjdG9yeSwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgcmV0dXJuIEdhbWVGYWN0b3J5LmdldEdhbWUoJHN0YXRlUGFyYW1zLmdhbWVJZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL2hvbWUuaHRtbCdcbiAgICB9KTtcbn0pOyIsImFwcC5jb250cm9sbGVyKFwiTG9iYnlDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRzY29wZSwgRmlyZWJhc2VGYWN0b3J5KSB7XG5cblx0dmFyIHRlc3RrZXkgPSAnNTZmODhmY2MwNmYyMDBhZjI1YTBhNWY5J1xuXHRcblx0dmFyIGFsbEdhbWVzID0gRmlyZWJhc2VGYWN0b3J5LmdldEJhc2UoKVxuXHQkc2NvcGUuZ2FtZXMgPSBhbGxHYW1lc1xuXHQvLyBjb25zb2xlLmxvZyhhbGxHYW1lcylcblxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKXtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvYmJ5Jywge1xuXHRcdHVybDogJy9sb2JieScsXG5cdFx0Y29udHJvbGxlcjogJ0xvYmJ5Q29udHJvbGxlcicsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9sb2JieS9sb2JieS5odG1sJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRib2FyZHM6IGZ1bmN0aW9uKEJvYXJkRmFjdG9yeSkge1xuXHRcdFx0XHRyZXR1cm4gQm9hcmRGYWN0b3J5LmdldEFsbEJvYXJkcygpXG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbWVtYmVyc09ubHknLCB7XG4gICAgICAgIHVybDogJy9tZW1iZXJzLWFyZWEnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxpbWcgbmctcmVwZWF0PVwiaXRlbSBpbiBzdGFzaFwiIHdpZHRoPVwiMzAwXCIgbmctc3JjPVwie3sgaXRlbSB9fVwiIC8+JyxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgU2VjcmV0U3Rhc2gpIHtcbiAgICAgICAgICAgIFNlY3JldFN0YXNoLmdldFN0YXNoKCkudGhlbihmdW5jdGlvbiAoc3Rhc2gpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3Rhc2ggPSBzdGFzaDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRhdGEuYXV0aGVudGljYXRlIGlzIHJlYWQgYnkgYW4gZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgLy8gdGhhdCBjb250cm9scyBhY2Nlc3MgdG8gdGhpcyBzdGF0ZS4gUmVmZXIgdG8gYXBwLmpzLlxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmZhY3RvcnkoJ1NlY3JldFN0YXNoJywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICB2YXIgZ2V0U3Rhc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9zZWNyZXQtc3Rhc2gnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRTdGFzaDogZ2V0U3Rhc2hcbiAgICB9O1xuXG59KTsiLCJhcHAuY29udHJvbGxlcihcIldhaXRpbmdSb29tQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsIGdhbWUsICRzdGF0ZVBhcmFtcywgUGxheWVyRmFjdG9yeSwgRmlyZWJhc2VGYWN0b3J5KSB7XG5cblx0JHNjb3BlLmdhbWVJRCA9ICRzdGF0ZVBhcmFtcy5pZFxuXG5cdHZhciBsb2NhbEdhbWVQbGF5ZXJzID0gRmlyZWJhc2VGYWN0b3J5LmdldENvbm5lY3Rpb24oJHNjb3BlLmdhbWVJRCArICcvZ2FtZScgKyAnL3BsYXllcnMnKVxuXHQkc2NvcGUucGxheWVycyA9IGxvY2FsR2FtZVBsYXllcnNcblxuXHQkc2NvcGUuZ2FtZSA9IGdhbWVcblx0JHNjb3BlLnJvYm90cyA9IFt7bmFtZTogXCJTcGluIEJvdFwiLCBpbWdVcmw6IFwiL2ltZy9yb2JvdHMvc3BpbmJvdC5qcGdcIn0sIHtuYW1lOiBcIlR3b25reVwiLCBpbWdVcmw6IFwiL2ltZy9yb2JvdHMvdHdvbmt5LmpwZ1wifSwge25hbWU6IFwiWm9vbSBCb3RcIiwgaW1nVXJsOiBcIi9pbWcvcm9ib3RzL3pvb21ib3QuanBnXCJ9XVxuXG5cdCRzY29wZS5DcmVhdGVQbGF5ZXIgPSBmdW5jdGlvbihwbGF5ZXIsIGdhbWVJRCkge1xuXHRcdHJldHVybiBQbGF5ZXJGYWN0b3J5LmNyZWF0ZVBsYXllcihwbGF5ZXIsICRzY29wZS5nYW1lSUQpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocGxheWVySW5mbykge1xuXHRcdFx0Y29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHJlc3BvbnNlJywgcGxheWVySW5mbylcblx0XHRcdC8vICRzdGF0ZS5nbygnd2FpdGluZ3Jvb20nLCB7aWQ6IGdhbWVJbmZvLl9pZH0pXG5cdFx0fSlcblx0fVxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKXtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3dhaXRpbmdyb29tJywge1xuXHRcdHVybDogJy93YWl0aW5ncm9vbS86aWQnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvd2FpdGluZ3Jvb20vd2FpdGluZ3Jvb20uaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ1dhaXRpbmdSb29tQ29udHJvbGxlcicsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0Z2FtZTogZnVuY3Rpb24oR2FtZUZhY3RvcnksICRzdGF0ZVBhcmFtcykge1xuXHRcdFx0XHRjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgc3RhdGVQYXJhbXM6JywgJHN0YXRlUGFyYW1zKVxuXHRcdFx0XHRyZXR1cm4gR2FtZUZhY3RvcnkuZ2V0R2FtZSgkc3RhdGVQYXJhbXMuaWQpXG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxufSkiLCJhcHAuZmFjdG9yeSgnQm9hcmRGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuXHRyZXR1cm4ge1xuXHRcdGdldEFsbEJvYXJkczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2JvYXJkLycpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5kYXRhKVxuXHRcdH0sXG5cdFx0Z2V0T25lQm9hcmQ6IGZ1bmN0aW9uKGJvYXJkSWQpIHtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvYm9hcmQvJyArIGJvYXJkSWQpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5kYXRhKVxuXHRcdH1cblx0fVxufSkiLCJhcHAuZmFjdG9yeSgnRmlyZWJhc2VGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlQXJyYXkpIHtcblxuXHR2YXIgRmlyZWJhc2VGYWN0b3J5ID0ge307XG5cblx0dmFyIGJhc2VVcmwgPSBcImh0dHBzOi8vcmVzcGxlbmRlbnQtdG9yY2gtNDMyMi5maXJlYmFzZWlvLmNvbS9cIjtcblx0dmFyIGJhc2VDb25uZWN0aW9uID0gJGZpcmViYXNlQXJyYXkobmV3IEZpcmViYXNlKGJhc2VVcmwpKVxuXG5cdEZpcmViYXNlRmFjdG9yeS5nZXRDb25uZWN0aW9uID0gZnVuY3Rpb24oa2V5KSB7XG5cdFx0dmFyIGxvY2FsQ29ubmVjdGlvbiA9ICRmaXJlYmFzZUFycmF5KG5ldyBGaXJlYmFzZShiYXNlVXJsICsga2V5KSlcblx0XHRyZXR1cm4gbG9jYWxDb25uZWN0aW9uXG5cdH1cblxuXHRGaXJlYmFzZUZhY3RvcnkuZ2V0QmFzZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBiYXNlQ29ubmVjdGlvblxuXHR9XG5cblx0cmV0dXJuIEZpcmViYXNlRmFjdG9yeVxuXG59KSIsImFwcC5mYWN0b3J5KCdGdWxsc3RhY2tQaWNzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBbXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjdnQlh1bENBQUFYUWNFLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL2ZiY2RuLXNwaG90b3MtYy1hLmFrYW1haWhkLm5ldC9ocGhvdG9zLWFrLXhhcDEvdDMxLjAtOC8xMDg2MjQ1MV8xMDIwNTYyMjk5MDM1OTI0MV84MDI3MTY4ODQzMzEyODQxMTM3X28uanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLUxLVXNoSWdBRXk5U0suanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNzktWDdvQ01BQWt3N3kuanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLVVqOUNPSUlBSUZBaDAuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNnlJeUZpQ0VBQXFsMTIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRS1UNzVsV0FBQW1xcUouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRXZaQWctVkFBQWs5MzIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRWdOTWVPWElBSWZEaEsuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRVF5SUROV2dBQXU2MEIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQ0YzVDVRVzhBRTJsR0ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWVWdzVTV29BQUFMc2ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWFKSVA3VWtBQWxJR3MuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQVFPdzlsV0VBQVk5RmwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLU9RYlZyQ01BQU53SU0uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9COWJfZXJ3Q1lBQXdSY0oucG5nOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNVBUZHZuQ2NBRUFsNHguanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNHF3QzBpQ1lBQWxQR2guanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CMmIzM3ZSSVVBQTlvMUQuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cd3BJd3IxSVVBQXZPMl8uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cc1NzZUFOQ1lBRU9oTHcuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSjR2TGZ1VXdBQWRhNEwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSTd3empFVkVBQU9QcFMuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSWRIdlQyVXNBQW5uSFYuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DR0NpUF9ZV1lBQW83NVYuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSVM0SlBJV0lBSTM3cXUuanBnOmxhcmdlJ1xuICAgIF07XG59KTtcbiIsImFwcC5mYWN0b3J5KCdHYW1lRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdHZhciBHYW1lRmFjdG9yeSA9IHt9O1xuXG5cdEdhbWVGYWN0b3J5LmNyZWF0ZVBsYXllckFuZEdhbWUgPSBmdW5jdGlvbihkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZ2FtZS8nLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0cmV0dXJuIHJlcy5kYXRhXG5cdFx0fSlcblx0fVxuXG5cdEdhbWVGYWN0b3J5LmdldEdhbWUgPSBmdW5jdGlvbihnYW1lSWQpe1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZ2FtZS8nICsgZ2FtZUlkKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHRyZXR1cm4gcmVzLmRhdGFcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBHYW1lRmFjdG9yeTtcbn0pIiwiYXBwLmZhY3RvcnkoJ1BsYXllckZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xuXG5cdHZhciBQbGF5ZXJGYWN0b3J5ID0ge307XG5cblx0UGxheWVyRmFjdG9yeS5jcmVhdGVQbGF5ZXIgPSBmdW5jdGlvbihkYXRhLCBpZCkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3BsYXllci8nLCB7cGFyYW1zOntcImRhdGFcIjogZGF0YSwgXCJpZFwiOiBpZH19KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0cmV0dXJuIHJlcy5kYXRhXG5cdFx0fSlcblx0fVxuXG5cdHJldHVybiBQbGF5ZXJGYWN0b3J5XG5cbn0pIiwiYXBwLmZhY3RvcnkoJ1JhbmRvbUdyZWV0aW5ncycsIGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBnZXRSYW5kb21Gcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICAgIHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldO1xuICAgIH07XG5cbiAgICB2YXIgZ3JlZXRpbmdzID0gW1xuICAgICAgICAnSGVsbG8sIHdvcmxkIScsXG4gICAgICAgICdBdCBsb25nIGxhc3QsIEkgbGl2ZSEnLFxuICAgICAgICAnSGVsbG8sIHNpbXBsZSBodW1hbi4nLFxuICAgICAgICAnV2hhdCBhIGJlYXV0aWZ1bCBkYXkhJyxcbiAgICAgICAgJ0lcXCdtIGxpa2UgYW55IG90aGVyIHByb2plY3QsIGV4Y2VwdCB0aGF0IEkgYW0geW91cnMuIDopJyxcbiAgICAgICAgJ1RoaXMgZW1wdHkgc3RyaW5nIGlzIGZvciBMaW5kc2F5IExldmluZS4nLFxuICAgICAgICAn44GT44KT44Gr44Gh44Gv44CB44Om44O844K244O85qeY44CCJyxcbiAgICAgICAgJ1dlbGNvbWUuIFRvLiBXRUJTSVRFLicsXG4gICAgICAgICc6RCcsXG4gICAgICAgICdZZXMsIEkgdGhpbmsgd2VcXCd2ZSBtZXQgYmVmb3JlLicsXG4gICAgICAgICdHaW1tZSAzIG1pbnMuLi4gSSBqdXN0IGdyYWJiZWQgdGhpcyByZWFsbHkgZG9wZSBmcml0dGF0YScsXG4gICAgICAgICdJZiBDb29wZXIgY291bGQgb2ZmZXIgb25seSBvbmUgcGllY2Ugb2YgYWR2aWNlLCBpdCB3b3VsZCBiZSB0byBuZXZTUVVJUlJFTCEnLFxuICAgIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBncmVldGluZ3M6IGdyZWV0aW5ncyxcbiAgICAgICAgZ2V0UmFuZG9tR3JlZXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21Gcm9tQXJyYXkoZ3JlZXRpbmdzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ0N0cmxQYW5lbEN0cmwnLCBmdW5jdGlvbigkc2NvcGUpe1xuICAvLyAkc2NvcGUucmVnaXN0ZXJcbiAgLy8gJHNjb3BlLmNsaWNrZWRDYXJkID0gZnVuY3Rpb24oY2FyZCl7XG5cbiAgLy8gfVxuXG59KSIsInZhciBwcm9ncmFtQ2FyZHMgPSBbXG4gICAgICAgICAgICAgICB7IG5hbWU6ICd1JywgIHByaW9yaXR5OiAxMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAndScsICBwcmlvcml0eTogMjAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ3UnLCAgcHJpb3JpdHk6IDMwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICd1JywgIHByaW9yaXR5OiA0MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAndScsICBwcmlvcml0eTogNTAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ3UnLCAgcHJpb3JpdHk6IDYwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDcwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdyJywgIHByaW9yaXR5OiA4MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnbCcsIHByaW9yaXR5OiA5MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMTAwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDExMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMTIwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDEzMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMTQwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDE1MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMTYwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDE3MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMTgwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDE5MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMjAwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDIxMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMjIwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDIzMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMjQwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDI1MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMjYwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDI3MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMjgwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDI5MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMzAwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDMxMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMzIwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDMzMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMzQwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDM1MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMzYwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDM3MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogMzgwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDM5MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogNDAwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdsJywgcHJpb3JpdHk6IDQxMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAncicsICBwcmlvcml0eTogNDIwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdiYWNrdXAnLCBwcmlvcml0eTogNDMwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdiYWNrdXAnLCBwcmlvcml0eTogNDQwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdiYWNrdXAnLCBwcmlvcml0eTogNDUwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdiYWNrdXAnLCBwcmlvcml0eTogNDYwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdiYWNrdXAnLCBwcmlvcml0eTogNDcwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdiYWNrdXAnLCBwcmlvcml0eTogNDgwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMScsIHByaW9yaXR5OiA0OTAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YxJywgcHJpb3JpdHk6IDUwMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjEnLCBwcmlvcml0eTogNTEwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMScsIHByaW9yaXR5OiA1MjAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YxJywgcHJpb3JpdHk6IDUzMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjEnLCBwcmlvcml0eTogNTQwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMScsIHByaW9yaXR5OiA1NTAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YxJywgcHJpb3JpdHk6IDU2MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjEnLCBwcmlvcml0eTogNTcwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMScsIHByaW9yaXR5OiA1ODAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YxJywgcHJpb3JpdHk6IDU5MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjEnLCBwcmlvcml0eTogNjAwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMScsIHByaW9yaXR5OiA2MTAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YxJywgcHJpb3JpdHk6IDYyMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjEnLCBwcmlvcml0eTogNjMwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMScsIHByaW9yaXR5OiA2NDAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YxJywgcHJpb3JpdHk6IDY1MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjEnLCBwcmlvcml0eTogNjYwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMicsIHByaW9yaXR5OiA2NzAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YyJywgcHJpb3JpdHk6IDY4MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjInLCBwcmlvcml0eTogNjkwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMicsIHByaW9yaXR5OiA3MDAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YyJywgcHJpb3JpdHk6IDcxMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjInLCBwcmlvcml0eTogNzIwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMicsIHByaW9yaXR5OiA3MzAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YyJywgcHJpb3JpdHk6IDc0MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjInLCBwcmlvcml0eTogNzUwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMicsIHByaW9yaXR5OiA3NjAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YyJywgcHJpb3JpdHk6IDc3MCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjInLCBwcmlvcml0eTogNzgwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMicsIHByaW9yaXR5OiA3OTAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YzJywgcHJpb3JpdHk6IDgwMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjMnLCBwcmlvcml0eTogODEwIH0sXG4gICAgICAgICAgICAgICB7IG5hbWU6ICdmMycsIHByaW9yaXR5OiA4MjAgfSxcbiAgICAgICAgICAgICAgIHsgbmFtZTogJ2YzJywgcHJpb3JpdHk6IDgzMCB9LFxuICAgICAgICAgICAgICAgeyBuYW1lOiAnZjMnLCBwcmlvcml0eTogODQwIH0gXTtcblxuXG5hcHAuZGlyZWN0aXZlKCdjdHJscGFuZWwnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9nYW1lL2N0cmxQYW5lbC9jdHJscGFuZWwuaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgIFx0Z2FtZTogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGNvbnRyb2xsZXI6ICdDdHJsUGFuZWxDdHJsJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUpe1xuICAgICAgICAgIGZ1bmN0aW9uIGNob3AoYXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYXJkcyA9IGFyci5tYXAoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgIHJldHVybiBwcm9ncmFtQ2FyZHNbKGMvMTApLTFdXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgdmFyIGNob3BwZWQgPSBbXTtcbiAgICAgICAgICAgIHZhciBzdWJBcnIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgc3ViQXJyLnB1c2gocHJvZ3JhbUNhcmRzW2FycltpXS8xMCAtIDFdKTtcbiAgICAgICAgICAgICAgaWYoc3ViQXJyLmxlbmd0aCA9PT0gMyl7XG4gICAgICAgICAgICAgICAgY2hvcHBlZC5wdXNoKHN1YkFycik7XG4gICAgICAgICAgICAgICAgc3ViQXJyID0gW107XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNob3BwZWQpO1xuICAgICAgICAgICAgcmV0dXJuIGNob3BwZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2NvcGUuY2FyZHMgPSBjaG9wKFsxMDAsIDM0MCwgNzIwLCAxMCwgMjAwLCA4MjAsIDcwMCwgNTMwLCA2MTBdKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5cbmFwcC5kaXJlY3RpdmUoJ2RyYWdnYWJsZScsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCl7XG4gICAgdmFyIGVsID0gZWxlbWVudFswXTtcbiAgICBlbC5kcmFnZ2FibGUgPSB0cnVlO1xuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oZXYpe1xuICAgICAgZXYuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSc7XG4gICAgICBldi5kYXRhVHJhbnNmZXIuc2V0RGF0YSgnVGV4dCcsIGVsLmF0dHJpYnV0ZXNbJ2NhcmRkYXRhJ10udmFsdWUpO1xuICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdkcmFnJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgLy8gZWwuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2KXtcbiAgICAvLyAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZycpO1xuICAgIC8vICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vIH0sIGZhbHNlKTtcbiAgfVxufSk7XG5cbmFwcC5kaXJlY3RpdmUoJ2Ryb3BwYWJsZScsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgc2NvcGU6IHt9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KXtcbiAgICAgIHZhciBlbCA9IGVsZW1lbnRbMF07XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgZnVuY3Rpb24oZXYpe1xuICAgICAgICBldi5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJztcbiAgICAgICAgaWYoZXYucHJldmVudERlZmF1bHQpIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LCBmYWxzZSk7XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LCBmYWxzZSk7XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LCBmYWxzZSk7XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCBmdW5jdGlvbihldil7XG4gICAgICAgIGlmKGV2LnN0b3BQcm9wYWdhdGlvbikgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXG4gICAgICAgIHZhciBjYXJkSWQgPSBldi5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgnVGV4dCcpO1xuICAgICAgICB0aGlzLmNhcmRkYXRhID0gY2FyZElkO1xuXG4gICAgICAgIC8vYWRkIGltYWdlIHRvIHJlZ2lzdGVyXG4gICAgICAgIHZhciBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgIGl0ZW0uc3JjID0gXCIvaW1nL2NhcmRzL1wiICsgcHJvZ3JhbUNhcmRzW2NhcmRJZC8xMC0xXS5uYW1lICsgXCIucG5nXCJcbiAgICAgICAgaXRlbS5oZWlnaHQgPSAxMDA7XG4gICAgICAgIGl0ZW0ud2lkdGggPSA3MDtcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChpdGVtKTtcblxuICAgICAgICB2YXIgaGFuZENhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbY2FyZGRhdGE9XCInICsgY2FyZElkICsgJ1wiXScpWzBdO1xuICAgICAgICBoYW5kQ2FyZC5jbGFzc0xpc3QuYWRkKCdlbXB0eS1jYXJkJyk7XG4gICAgICAgIGhhbmRDYXJkLnJlbW92ZUF0dHJpYnV0ZSgnY2FyZGRhdGEnKTtcbiAgICAgICAgaGFuZENhcmQucmVtb3ZlQ2hpbGQoaGFuZENhcmQuY2hpbGROb2Rlc1swXSk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSwgZmFsc2UpO1xuICAgIH1cbiAgfVxufSkiLCJhcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCdcbiAgICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdIb21lJywgc3RhdGU6ICdob21lJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdBYm91dCcsIHN0YXRlOiAnbG9iYnknIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0RvY3VtZW50YXRpb24nLCBzdGF0ZTogJ2RvY3MnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ01lbWJlcnMgT25seScsIHN0YXRlOiAnbWVtYmVyc09ubHknLCBhdXRoOiB0cnVlIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
