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

app.directive('buildBoard', function () {

    return {
        restrict: 'E',
        templateUrl: '/js/common/directives/board/build-board.html',
        link: function link(scope, element) {
            //this function comes from streamlined.js
            window.start();
        }
    };
});
window.start = function () {
    document.getElementById("board").appendChild(renderer.view);
};

var stage = new PIXI.Stage(0x66ff99);
var renderer = new PIXI.CanvasRenderer(450, 450);

//all image files are 150px. Do not change this number!
var imgSizeActual = 150;

//factor to rescale images by. This number can be changed
var imgScale = 4;

var imgSize = imgSizeActual / imgScale;

var tileImg = {
    "0": { "image": "/img/repair.jpg" },
    "1": { "image": "/img/option.jpg" },
    "2": { "image": "/img/empty.jpg" },
    "3": { "image": "/img/void.jpg" },
    "4": { "image": "/img/roller-express-wn.jpg" },
    "5": { "image": "/img/roller-express-south.jpg" },
    "6": { "image": "/img/roller-express-es.jpg" },
    "7": { "image": "/img/roller-express-sw.jpg" },
    "8": { "image": "/img/roller-express-se.jpg" },
    "9": { "image": "/img/roller-express-west.jpg" },
    "10": { "image": "/img/roller-express-north.jpg" },
    "11": { "image": "/img/roller-express-east.jpg" },
    "12": { "image": "/img/roller-east.png" },
    "13": { "image": "/img/roller-west.png" },
    "18": { "image": "/img/spinner-clockwise.jpg" },
    "19": { "image": "/img/spinner-counterclockwise.jpg" }
};

var walls = {
    "noLaser": "/img/wall.png",

    //images related to lasers that are on the north or east walls
    "oneLaserNE": "/img/laser-single-NE.png",
    "twoLasersNE": "/img/laser-double-NE.png",
    "threeLasersNE": "/img/laser-triple-NE.png",

    //images related to lasers that are on the south or west walls,
    "oneLaserSW": "/img/laser-single-SW.png",
    "twoLasersSW": "/img/laser-double-SW.png",
    "threeLasersSW": "/img/laser-triple-SW.png",

    map: [
    //row, col, direction, number of lasers
    [0, 2, "north", 0], [0, 4, "north", 0], [0, 7, "north", 0], [0, 9, "north", 0], [2, 0, "west", 0], [2, 3, "south", 0], [2, 11, "east", 0], [3, 5, "west", 0], [3, 6, "east", 1], [4, 0, "west", 0], [4, 11, "east", 0], [5, 8, "north", 1], [6, 3, "south", 1], [7, 0, "west", 0], [7, 11, "east", 0], [8, 5, "west", 1], [8, 6, "east", 0], [9, 0, "west", 0], [9, 8, "north", 0], [9, 11, "east", 0], [11, 2, "south", 0], [11, 4, "south", 0], [11, 7, "south", 0], [11, 9, "south", 0]],
    getWallImg: function getWallImg(coordinate) {
        var direction = coordinate[2];
        var numLasers = coordinate[3];
        var laserImgFile;
        var wallSrc;

        if (direction === "north" || direction === "east") laserImgFile = "NE";else laserImgFile = "SW";

        if (numLasers === 1) wallSrc = walls["oneLaser" + laserImgFile];else if (numLasers === 2) wallSrc = walls["twoLasers" + laserImgFile];else if (numLasers === 3) wallSrc = walls["threeLasers" + laserImgFile];else wallSrc = walls.noLaser;
        return wallSrc;
    }
};

var lasers = {
    map: [
    //start, end, vertical or horizontal
    [[6, 3], [5, 3], "h"], [[8, 5], [8, 8], "v"], [[3, 6], [3, 2], "v"], [[5, 8], [6, 8], "h"]]
};

var tiles = {
    cols: 12,
    rows: 12,
    map: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 11, 11, 6, 2, 2, 8, 11, 11, 6, 2, 2, 10, 18, 2, 5, 19, 2, 10, 18, 2, 5, 2, 2, 10, 0, 18, 5, 2, 2, 10, 1, 18, 5, 2, 2, 4, 9, 9, 7, 2, 19, 4, 9, 9, 7, 2, 2, 2, 2, 2, 19, 2, 2, 2, 2, 19, 2, 2, 2, 2, 19, 2, 2, 2, 2, 19, 2, 2, 2, 2, 2, 8, 11, 11, 6, 19, 2, 8, 11, 11, 6, 2, 2, 10, 18, 1, 5, 2, 2, 10, 18, 0, 5, 2, 2, 10, 2, 18, 5, 2, 19, 10, 2, 18, 5, 2, 2, 4, 9, 9, 7, 2, 2, 4, 9, 9, 7, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    getTileImg: function getTileImg(col, row) {
        var tileId = this.map[row * this.rows + col].toString();
        var tileSrc = tileImg[tileId].image;
        return tileSrc;
    }
};

function buildMap() {
    buildTiles();
    buildWalls();
    drawLasers();
    drawPlayers(players, players1stMove);
}

function buildTiles() {
    for (var col = 0; col < tiles.cols; col++) {
        for (var row = 0; row < tiles.rows; row++) {
            var tileSrc = tiles.getTileImg(col, row);
            //150x150 is the actual image size
            var tile = new PIXI.extras.TilingSprite.fromImage(tileSrc, imgSizeActual, imgSizeActual);

            tile.position.x = imgSize * col;
            tile.position.y = imgSize * row;
            //rescales the 150px tile image to be 4 times smaller
            tile.scale.set(1 / imgScale, 1 / imgScale);

            stage.addChild(tile);
        }
    }
}

function buildWalls() {
    for (var i = 0; i < walls.map.length; i++) {
        var wallSrc = walls.getWallImg(walls.map[i]);
        var wall = new PIXI.Sprite(PIXI.Texture.fromImage(wallSrc));

        wall.position.x = imgSize * walls.map[i][1];
        wall.position.y = imgSize * walls.map[i][0];
        wall.scale.set(1 / imgScale, 1 / imgScale);

        if (walls.map[i][2] === "west") {
            wall.rotation = Math.PI / 2;
            if (walls.map[i][3] > 0) wall.position.x = wall.position.x + 37.5;else wall.position.x = wall.position.x + 5;
        } else if (walls.map[i][2] === "south") {
            if (walls.map[i][3] === 0) wall.position.y = wall.position.y + imgSize - 5;
        } else if (walls.map[i][2] === "east") {
            wall.rotation = Math.PI / 2;
            wall.position.x = wall.position.x + 37.5;
        }

        stage.addChild(wall);
    }
}

function drawLasers() {
    if (lasers) {
        for (var i = 0; i < lasers.map.length; i++) {
            var line = new PIXI.Graphics();
            var xFrom, yFrom, xTo, yTo;
            if (lasers.map[i][2] === "h" && lasers.map[i][0][0] > lasers.map[i][1][0]) {
                xFrom = lasers.map[i][0][0] + 0.7;
                yFrom = lasers.map[i][0][1] + 0.5;
                xTo = lasers.map[i][1][0] + 0.1;
                yTo = lasers.map[i][1][1] + 0.5;
            } else if (lasers.map[i][2] === "h") {
                xFrom = lasers.map[i][0][0] + 0.3;
                yFrom = lasers.map[i][0][1] + 0.5;
                xTo = lasers.map[i][1][0] + 0.9;
                yTo = lasers.map[i][1][1] + 0.5;
            } else if (lasers.map[i][2] === "v" && lasers.map[i][0][1] > lasers.map[i][1][1]) {
                xFrom = lasers.map[i][0][0] + 0.5;
                yFrom = lasers.map[i][0][1] + 0.7;
                xTo = lasers.map[i][1][0] + 0.5;
                yTo = lasers.map[i][1][1] + 1;
            } else {
                xFrom = lasers.map[i][0][0] + 0.5;
                yFrom = lasers.map[i][0][1] + 0.1;
                xTo = lasers.map[i][1][0] + 0.5;
                yTo = lasers.map[i][1][1] + 1;
            }

            line.lineStyle(1, 0xff0000);
            line.moveTo(xFrom * 37.5, yFrom * 37.5);
            line.lineTo(xTo * 37.5, yTo * 37.5);

            stage.addChild(line);
        }
    }
}

function init() {
    renderer.render(stage);
}

// var gameState = play;

var robotImgs = {
    //robot name: robot image path
    "green": "/img/robots/robot_0.png",
    "blue": "/img/robots/robot_1.png",
    "yellow": "/img/robots/robot_2.png",
    getRobotImg: function getRobotImg(robotName) {
        return robotImgs[robotName];
    }
};

var player1, player2, player3;
//seed for original location
var players = [{ player: "player1", location: [0, 11], bearing: [-1, 0], robot: "green", priorityVal: null }, { player: "player2", location: [2, 11], bearing: [-1, 0], robot: "blue", priorityVal: null }, { player: "player3", location: [4, 11], bearing: [-1, 0], robot: "yellow", priorityVal: null }];

//seed for second location
var players1stMove = [{ player: "player1", location: [0, 9], bearing: [-1, 0], robot: "green", priorityVal: 500 }, { player: "player2", location: [2, 7], bearing: [1, 0], robot: "blue", priorityVal: 200 }, { player: "player3", location: [4, 8], bearing: [0, 1], robot: "yellow", priorityVal: 800 }];

function sortIntialDestination(initial, sortedDestination) {
    var sortedInitial = [];

    for (var i = 0; i < sortedDestination.length; i++) {
        for (var j = 0; j < initial.length; j++) {
            if (initial[j].robot === sortedDestination[i].robot) {
                sortedInitial.push(initial[j]);
            }
        }
    }
    return sortedInitial;
}

function drawPlayers(initial, destination) {
    var sortedDestination = sortPlayersByPriority(destination);
    console.log(sortedDestination);

    var sortedInitial = sortIntialDestination(initial, sortedDestination);
    console.log('sorted initial in the drawplayers fnc', sortedInitial);
    sortedInitial.forEach(function (player, idx) {

        setTimeout(doSomething.bind(null, player), idx * 2000);

        function doSomething() {

            var robotImg = robotImgs.getRobotImg(player.robot);
            var robot = new PIXI.Sprite(PIXI.Texture.fromImage(robotImg));
            robot.position.x = imgSize * player.location[0];
            robot.position.y = imgSize * player.location[1];
            robot.scale.set(1 / imgScale, 1 / imgScale);

            stage.addChild(robot);

            movePlayer();

            function movePlayer() {
                if (robot.position.y >= imgSize * sortedDestination[idx].location[1]) {
                    requestAnimationFrame(movePlayer);
                    robot.position.y -= 1;
                    renderer.render(stage);
                }
            }
        }
    });
    // movePlayer();
}
// function drawPlayers(intial, destination) {
//   players.forEach(function(player){

//   })
// }

function sortPlayersByPriority(arrOfPlayerObjects) {
    return arrOfPlayerObjects.sort(function (a, b) {
        return b.priorityVal - a.priorityVal;
    });
}

buildMap();

// function drawPlayers(initial, destination) {
//   initial.forEach(function(player, idx){
//     var robotImg = robotImgs.getRobotImg(player.robot);
//     var robot = new PIXI.Sprite(PIXI.Texture.fromImage(robotImg));
//     robot.position.x = imgSize*player.location[0];
//     robot.position.y = imgSize*player.location[1];
//     robot.scale.set(1/imgScale, 1/imgScale);

//     stage.addChild(robot);

//     movePlayer()

//     function movePlayer() {
//       if(robot.position.y >= imgSize*destination[idx].location[1]) {
//         requestAnimationFrame(movePlayer);
//         robot.position.y -= 1;
//         renderer.render(stage);
//       }
//     }
//   })

//     // movePlayer();
// }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJkb2NzL2RvY3MuanMiLCJob21lL2hvbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvYmJ5L2xvYmJ5LmNvbnRyb2xsZXIuanMiLCJsb2JieS9sb2JieS5zdGF0ZS5qcyIsIm1lbWJlcnMtb25seS9tZW1iZXJzLW9ubHkuanMiLCJjb21tb24vZmFjdG9yaWVzL0ZpcmViYXNlRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRnVsbHN0YWNrUGljcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUmFuZG9tR3JlZXRpbmdzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYm9hcmQvYnVpbGQtYm9hcmQtZGlyZWN0aXZlLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYm9hcmQvc3RyZWFtbGluZWQuanMiLCJjb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBOztBQUVBLHFCQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7QUFHQSxHQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7OztBQUdBLFFBQUEsNEJBQUEsR0FBQSxTQUFBLDRCQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBO0tBQ0EsQ0FBQTs7OztBQUlBLGNBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBOztBQUVBLFlBQUEsQ0FBQSw0QkFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBOzs7QUFHQSxtQkFBQTtTQUNBOztBQUVBLFlBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxFQUFBOzs7QUFHQSxtQkFBQTtTQUNBOzs7QUFHQSxhQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7Ozs7QUFJQSxnQkFBQSxJQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDbERBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7OztBQUdBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxpQkFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQTs7O0FBR0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDaEJBLENBQUEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBOzs7O0FBSUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsVUFBQSxLQUFBLElBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7Ozs7O0FBS0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7O0FDcElBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsT0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDTEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxjQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDRCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0JBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxlQUFBLEVBQUE7O0FBRUEsUUFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsZUFBQSxDQUFBLGFBQUEsQ0FBQSxPQUFBLEdBQUEsT0FBQSxDQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFlBQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ1ZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDTkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsZUFBQTtBQUNBLGdCQUFBLEVBQUEsbUVBQUE7QUFDQSxrQkFBQSxFQUFBLG9CQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSx1QkFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBOzs7QUFHQSxZQUFBLEVBQUE7QUFDQSx3QkFBQSxFQUFBLElBQUE7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxTQUFBLFFBQUEsR0FBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsUUFBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMvQkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsZUFBQSxFQUFBOztBQUVBLFFBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLE9BQUEsR0FBQSxnREFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsYUFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxlQUFBLEdBQUEsZUFBQSxDQUFBLElBQUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxlQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUEsZUFBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDYkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUEsQ0FDQSx1REFBQSxFQUNBLHFIQUFBLEVBQ0EsaURBQUEsRUFDQSxpREFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLENBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUM3QkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxpQkFBQSxFQUFBLFlBQUE7O0FBRUEsUUFBQSxrQkFBQSxHQUFBLFNBQUEsa0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsUUFBQSxTQUFBLEdBQUEsQ0FDQSxlQUFBLEVBQ0EsdUJBQUEsRUFDQSxzQkFBQSxFQUNBLHVCQUFBLEVBQ0EseURBQUEsRUFDQSwwQ0FBQSxFQUNBLGNBQUEsRUFDQSx1QkFBQSxFQUNBLElBQUEsRUFDQSxpQ0FBQSxFQUNBLDBEQUFBLEVBQ0EsNkVBQUEsQ0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLFNBQUE7QUFDQSx5QkFBQSxFQUFBLDZCQUFBO0FBQ0EsbUJBQUEsa0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUM1QkEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLEVBQUEsWUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSw4Q0FBQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ1hBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtDQUNBLENBQUE7O0FBRUEsSUFBQSxLQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQTs7O0FBR0EsSUFBQSxhQUFBLEdBQUEsR0FBQSxDQUFBOzs7QUFHQSxJQUFBLFFBQUEsR0FBQSxDQUFBLENBQUE7O0FBRUEsSUFBQSxPQUFBLEdBQUEsYUFBQSxHQUFBLFFBQUEsQ0FBQTs7QUFFQSxJQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSxpQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLGlCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsZ0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSxlQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsNEJBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSwrQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsNEJBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLDhCQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsK0JBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSw4QkFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLHNCQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsc0JBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLG1DQUFBLEVBQUE7Q0FDQSxDQUFBOztBQUVBLElBQUEsS0FBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLGVBQUE7OztBQUdBLGdCQUFBLEVBQUEsMEJBQUE7QUFDQSxpQkFBQSxFQUFBLDBCQUFBO0FBQ0EsbUJBQUEsRUFBQSwwQkFBQTs7O0FBR0EsZ0JBQUEsRUFBQSwwQkFBQTtBQUNBLGlCQUFBLEVBQUEsMEJBQUE7QUFDQSxtQkFBQSxFQUFBLDBCQUFBOztBQUVBLE9BQUEsRUFBQTs7QUFFQSxLQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FDQTtBQUNBLGNBQUEsRUFBQSxvQkFBQSxVQUFBLEVBQUE7QUFDQSxZQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLFlBQUEsQ0FBQTtBQUNBLFlBQUEsT0FBQSxDQUFBOztBQUVBLFlBQUEsU0FBQSxLQUFBLE9BQUEsSUFBQSxTQUFBLEtBQUEsTUFBQSxFQUFBLFlBQUEsR0FBQSxJQUFBLENBQUEsS0FDQSxZQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsU0FBQSxLQUFBLENBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxZQUFBLENBQUEsQ0FBQSxLQUNBLElBQUEsU0FBQSxLQUFBLENBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxZQUFBLENBQUEsQ0FBQSxLQUNBLElBQUEsU0FBQSxLQUFBLENBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLGFBQUEsR0FBQSxZQUFBLENBQUEsQ0FBQSxLQUNBLE9BQUEsR0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsZUFBQSxPQUFBLENBQUE7S0FDQTtDQUNBLENBQUE7O0FBRUEsSUFBQSxNQUFBLEdBQUE7QUFDQSxPQUFBLEVBQUE7O0FBRUEsS0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLENBQUEsQ0FDQTtDQUNBLENBQUE7O0FBRUEsSUFBQSxLQUFBLEdBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLENBQ0EsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0EsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQ0E7QUFDQSxjQUFBLEVBQUEsb0JBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsR0FBQSxDQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLE9BQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsZUFBQSxPQUFBLENBQUE7S0FDQTtDQUNBLENBQUE7O0FBRUEsU0FBQSxRQUFBLEdBQUE7QUFDQSxjQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxFQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsT0FBQSxFQUFBLGNBQUEsQ0FBQSxDQUFBO0NBQ0E7O0FBRUEsU0FBQSxVQUFBLEdBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBOztBQUVBLGdCQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBOztBQUVBLGdCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxHQUFBLENBQUE7O0FBRUEsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQTtDQUNBOztBQUVBLFNBQUEsVUFBQSxHQUFBO0FBQ0EsU0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsUUFBQSxDQUFBLENBQUE7O0FBRUEsWUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLE1BQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEtBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1NBQ0EsTUFDQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsT0FBQSxFQUFBO0FBQ0EsZ0JBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBLE1BQ0EsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLE1BQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQTtTQUNBOztBQUVBLGFBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7S0FDQTtDQUNBOztBQUVBLFNBQUEsVUFBQSxHQUFBO0FBQ0EsUUFBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7QUFDQSxnQkFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLENBQUE7QUFDQSxnQkFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxxQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EscUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxtQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO2FBQ0EsTUFDQSxJQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EscUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHFCQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxtQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsbUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTthQUNBLE1BQ0EsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxxQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EscUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxtQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFDQTtBQUNBLHFCQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxxQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsbUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7YUFDQTs7QUFFQSxnQkFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxFQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLEVBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQTtDQUNBOztBQUVBLFNBQUEsSUFBQSxHQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtDQUNBOzs7O0FBT0EsSUFBQSxTQUFBLEdBQUE7O0FBRUEsV0FBQSxFQUFBLHlCQUFBO0FBQ0EsVUFBQSxFQUFBLHlCQUFBO0FBQ0EsWUFBQSxFQUFBLHlCQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBLFNBQUEsRUFBQTtBQUNBLGVBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0tBQ0E7Q0FDQSxDQUFBOztBQUVBLElBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLENBQUE7O0FBRUEsSUFBQSxPQUFBLEdBQUEsQ0FDQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxFQUNBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLEVBQ0EsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsQ0FDQSxDQUFBOzs7QUFHQSxJQUFBLGNBQUEsR0FBQSxDQUNBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLENBQ0EsQ0FBQTs7QUFFQSxTQUFBLHFCQUFBLENBQUEsT0FBQSxFQUFBLGlCQUFBLEVBQUE7QUFDQSxRQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsU0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLGlCQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxLQUFBLGlCQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsNkJBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7YUFDQTtTQUNBO0tBQ0E7QUFDQSxXQUFBLGFBQUEsQ0FBQTtDQUNBOztBQUVBLFNBQUEsV0FBQSxDQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxRQUFBLGlCQUFBLEdBQUEscUJBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBOztBQUVBLFFBQUEsYUFBQSxHQUFBLHFCQUFBLENBQUEsT0FBQSxFQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsdUNBQUEsRUFBQSxhQUFBLENBQUEsQ0FBQTtBQUNBLGlCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFHQSxpQkFBQSxXQUFBLEdBQUE7O0FBRUEsZ0JBQUEsUUFBQSxHQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsaUJBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsaUJBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsaUJBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBOztBQUVBLHNCQUFBLEVBQUEsQ0FBQTs7QUFFQSxxQkFBQSxVQUFBLEdBQUE7QUFDQSxvQkFBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsSUFBQSxPQUFBLEdBQUEsaUJBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSx5Q0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EseUJBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLDRCQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO2lCQUNBO2FBQ0E7U0FDQTtLQUVBLENBQUEsQ0FBQTs7Q0FFQTs7Ozs7OztBQVFBLFNBQUEscUJBQUEsQ0FBQSxrQkFBQSxFQUFBO0FBQ0EsV0FBQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsQ0FBQSxXQUFBLEdBQUEsQ0FBQSxDQUFBLFdBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtDQUNBOztBQUVBLFFBQUEsRUFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZTQSxHQUFBLENBQUEsU0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEseURBQUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDTEEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSx5Q0FBQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQTs7QUFFQSxpQkFBQSxDQUFBLEtBQUEsR0FBQSxDQUNBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxlQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLGNBQUEsRUFBQSxLQUFBLEVBQUEsYUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsdUJBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsMkJBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLDBCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsZ0JBQUEsT0FBQSxHQUFBLFNBQUEsT0FBQSxHQUFBO0FBQ0EsMkJBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSx5QkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxVQUFBLEdBQUEsU0FBQSxVQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLG1CQUFBLEVBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7U0FFQTs7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0dlbmVyYXRlZEFwcCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnLCAnZmlyZWJhc2UnXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIH07XG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAvLyBSZWdpc3RlciBvdXIgKmFib3V0KiBzdGF0ZS5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWJvdXQnLCB7XG4gICAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBYm91dENvbnRyb2xsZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2Fib3V0L2Fib3V0Lmh0bWwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQWJvdXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgRnVsbHN0YWNrUGljcykge1xuXG4gICAgLy8gSW1hZ2VzIG9mIGJlYXV0aWZ1bCBGdWxsc3RhY2sgcGVvcGxlLlxuICAgICRzY29wZS5pbWFnZXMgPSBfLnNodWZmbGUoRnVsbHN0YWNrUGljcyk7XG5cbn0pOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG9jcycsIHtcbiAgICAgICAgdXJsOiAnL2RvY3MnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2RvY3MvZG9jcy5odG1sJ1xuICAgIH0pO1xufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL2hvbWUuaHRtbCdcbiAgICB9KTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgJHNjb3BlLmxvZ2luID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICRzY29wZS5zZW5kTG9naW4gPSBmdW5jdGlvbiAobG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICAgICBBdXRoU2VydmljZS5sb2dpbihsb2dpbkluZm8pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbnRyb2xsZXIoXCJMb2JieUNvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHNjb3BlLCBGaXJlYmFzZUZhY3RvcnkpIHtcblxuXHR2YXIgdGVzdGtleSA9ICcxMjM0J1xuXG5cdCRzY29wZS5sb2NhbENvbm5lY3Rpb24gPSBGaXJlYmFzZUZhY3RvcnkuZ2V0Q29ubmVjdGlvbih0ZXN0a2V5ICsgJy9nYW1lJylcblxuXHQkc2NvcGUuZ2FtZXMgPSBbXCJnYW1lMVwiLCBcImdhbWUyXCIsIFwiZ2FtZTNcIiwgXCJnYW1lNFwiXVxuXG5cdCRzY29wZS5pbmZvID0gWydnYW1lMSBpbmZvJywgJ2dhbWUyIGluZm8nLCAnZ2FtZTMgaW5mbycsICdnYW1lNCBpbmZvJ11cblxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKXtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvYmJ5Jywge1xuXHRcdHVybDogJy9sb2JieScsXG5cdFx0Y29udHJvbGxlcjogJ0xvYmJ5Q29udHJvbGxlcicsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9sb2JieS9sb2JieS5odG1sJ1xuXHR9KVxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ21lbWJlcnNPbmx5Jywge1xuICAgICAgICB1cmw6ICcvbWVtYmVycy1hcmVhJyxcbiAgICAgICAgdGVtcGxhdGU6ICc8aW1nIG5nLXJlcGVhdD1cIml0ZW0gaW4gc3Rhc2hcIiB3aWR0aD1cIjMwMFwiIG5nLXNyYz1cInt7IGl0ZW0gfX1cIiAvPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsIFNlY3JldFN0YXNoKSB7XG4gICAgICAgICAgICBTZWNyZXRTdGFzaC5nZXRTdGFzaCgpLnRoZW4oZnVuY3Rpb24gKHN0YXNoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXNoID0gc3Rhc2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBkYXRhLmF1dGhlbnRpY2F0ZSBpcyByZWFkIGJ5IGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIC8vIHRoYXQgY29udHJvbHMgYWNjZXNzIHRvIHRoaXMgc3RhdGUuIFJlZmVyIHRvIGFwcC5qcy5cbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdTZWNyZXRTdGFzaCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgdmFyIGdldFN0YXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvc2VjcmV0LXN0YXNoJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3Rhc2g6IGdldFN0YXNoXG4gICAgfTtcblxufSk7IiwiYXBwLmZhY3RvcnkoJ0ZpcmViYXNlRmFjdG9yeScsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCkge1xuXG5cdHZhciBGaXJlYmFzZUZhY3RvcnkgPSB7fTtcblxuXHR2YXIgYmFzZVVybCA9IFwiaHR0cHM6Ly9yZXNwbGVuZGVudC10b3JjaC00MzIyLmZpcmViYXNlaW8uY29tL1wiO1xuXG5cdEZpcmViYXNlRmFjdG9yeS5nZXRDb25uZWN0aW9uID0gZnVuY3Rpb24oa2V5KSB7XG5cdFx0dmFyIGxvY2FsQ29ubmVjdGlvbiA9ICRmaXJlYmFzZU9iamVjdChuZXcgRmlyZWJhc2UoYmFzZVVybCArIGtleSkpXG5cdFx0cmV0dXJuIGxvY2FsQ29ubmVjdGlvblxuXHR9XG5cblx0cmV0dXJuIEZpcmViYXNlRmFjdG9yeVxuXG59KSIsImFwcC5mYWN0b3J5KCdGdWxsc3RhY2tQaWNzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBbXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjdnQlh1bENBQUFYUWNFLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL2ZiY2RuLXNwaG90b3MtYy1hLmFrYW1haWhkLm5ldC9ocGhvdG9zLWFrLXhhcDEvdDMxLjAtOC8xMDg2MjQ1MV8xMDIwNTYyMjk5MDM1OTI0MV84MDI3MTY4ODQzMzEyODQxMTM3X28uanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLUxLVXNoSWdBRXk5U0suanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNzktWDdvQ01BQWt3N3kuanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLVVqOUNPSUlBSUZBaDAuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNnlJeUZpQ0VBQXFsMTIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRS1UNzVsV0FBQW1xcUouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRXZaQWctVkFBQWs5MzIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRWdOTWVPWElBSWZEaEsuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRVF5SUROV2dBQXU2MEIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQ0YzVDVRVzhBRTJsR0ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWVWdzVTV29BQUFMc2ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWFKSVA3VWtBQWxJR3MuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQVFPdzlsV0VBQVk5RmwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLU9RYlZyQ01BQU53SU0uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9COWJfZXJ3Q1lBQXdSY0oucG5nOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNVBUZHZuQ2NBRUFsNHguanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNHF3QzBpQ1lBQWxQR2guanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CMmIzM3ZSSVVBQTlvMUQuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cd3BJd3IxSVVBQXZPMl8uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cc1NzZUFOQ1lBRU9oTHcuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSjR2TGZ1VXdBQWRhNEwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSTd3empFVkVBQU9QcFMuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSWRIdlQyVXNBQW5uSFYuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DR0NpUF9ZV1lBQW83NVYuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSVM0SlBJV0lBSTM3cXUuanBnOmxhcmdlJ1xuICAgIF07XG59KTtcbiIsImFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxuICAgICAgICAnQXQgbG9uZyBsYXN0LCBJIGxpdmUhJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciBwcm9qZWN0LCBleGNlcHQgdGhhdCBJIGFtIHlvdXJzLiA6KScsXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJyxcbiAgICAgICAgJ+OBk+OCk+OBq+OBoeOBr+OAgeODpuODvOOCtuODvOanmOOAgicsXG4gICAgICAgICdXZWxjb21lLiBUby4gV0VCU0lURS4nLFxuICAgICAgICAnOkQnLFxuICAgICAgICAnWWVzLCBJIHRoaW5rIHdlXFwndmUgbWV0IGJlZm9yZS4nLFxuICAgICAgICAnR2ltbWUgMyBtaW5zLi4uIEkganVzdCBncmFiYmVkIHRoaXMgcmVhbGx5IGRvcGUgZnJpdHRhdGEnLFxuICAgICAgICAnSWYgQ29vcGVyIGNvdWxkIG9mZmVyIG9ubHkgb25lIHBpZWNlIG9mIGFkdmljZSwgaXQgd291bGQgYmUgdG8gbmV2U1FVSVJSRUwhJyxcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXG4gICAgICAgIGdldFJhbmRvbUdyZWV0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTtcbiIsImFwcC5kaXJlY3RpdmUoJ2J1aWxkQm9hcmQnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9jb21tb24vZGlyZWN0aXZlcy9ib2FyZC9idWlsZC1ib2FyZC5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgXHQvL3RoaXMgZnVuY3Rpb24gY29tZXMgZnJvbSBzdHJlYW1saW5lZC5qc1xuICAgICAgICBcdHdpbmRvdy5zdGFydCgpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7Iiwid2luZG93LnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZFwiKS5hcHBlbmRDaGlsZChyZW5kZXJlci52aWV3KTtcbn1cblxudmFyIHN0YWdlID0gbmV3IFBJWEkuU3RhZ2UoMHg2NmZmOTkpO1xudmFyIHJlbmRlcmVyID0gbmV3IFBJWEkuQ2FudmFzUmVuZGVyZXIoNDUwLDQ1MCk7XG5cbi8vYWxsIGltYWdlIGZpbGVzIGFyZSAxNTBweC4gRG8gbm90IGNoYW5nZSB0aGlzIG51bWJlciFcbnZhciBpbWdTaXplQWN0dWFsID0gMTUwIFxuXG4vL2ZhY3RvciB0byByZXNjYWxlIGltYWdlcyBieS4gVGhpcyBudW1iZXIgY2FuIGJlIGNoYW5nZWRcbnZhciBpbWdTY2FsZSA9IDQgXG5cbnZhciBpbWdTaXplID0gaW1nU2l6ZUFjdHVhbC9pbWdTY2FsZVxuXG52YXIgdGlsZUltZyA9IHtcblwiMFwiOiB7XCJpbWFnZVwiOlwiL2ltZy9yZXBhaXIuanBnXCJ9LFxuXCIxXCI6IHtcImltYWdlXCI6XCIvaW1nL29wdGlvbi5qcGdcIn0sXG5cIjJcIjoge1wiaW1hZ2VcIjpcIi9pbWcvZW1wdHkuanBnXCJ9LFxuXCIzXCI6IHtcImltYWdlXCI6XCIvaW1nL3ZvaWQuanBnXCJ9LFxuXCI0XCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1leHByZXNzLXduLmpwZ1wifSxcblwiNVwiOiB7XCJpbWFnZVwiOlwiL2ltZy9yb2xsZXItZXhwcmVzcy1zb3V0aC5qcGdcIn0sXG5cIjZcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcm9sbGVyLWV4cHJlc3MtZXMuanBnXCJ9LFxuXCI3XCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1leHByZXNzLXN3LmpwZ1wifSxcblwiOFwiOiB7XCJpbWFnZVwiOlwiL2ltZy9yb2xsZXItZXhwcmVzcy1zZS5qcGdcIn0sXG5cIjlcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcm9sbGVyLWV4cHJlc3Mtd2VzdC5qcGdcIn0sXG5cIjEwXCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1leHByZXNzLW5vcnRoLmpwZ1wifSxcblwiMTFcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcm9sbGVyLWV4cHJlc3MtZWFzdC5qcGdcIn0sXG5cIjEyXCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1lYXN0LnBuZ1wifSxcblwiMTNcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcm9sbGVyLXdlc3QucG5nXCJ9LFxuXCIxOFwiOiB7XCJpbWFnZVwiOlwiL2ltZy9zcGlubmVyLWNsb2Nrd2lzZS5qcGdcIn0sXG5cIjE5XCI6IHtcImltYWdlXCI6XCIvaW1nL3NwaW5uZXItY291bnRlcmNsb2Nrd2lzZS5qcGdcIn1cbn07XG5cbnZhciB3YWxscyA9IHtcbiAgXCJub0xhc2VyXCI6IFwiL2ltZy93YWxsLnBuZ1wiLFxuXG4gIC8vaW1hZ2VzIHJlbGF0ZWQgdG8gbGFzZXJzIHRoYXQgYXJlIG9uIHRoZSBub3J0aCBvciBlYXN0IHdhbGxzXG4gIFwib25lTGFzZXJORVwiOiBcIi9pbWcvbGFzZXItc2luZ2xlLU5FLnBuZ1wiLFxuICBcInR3b0xhc2Vyc05FXCI6IFwiL2ltZy9sYXNlci1kb3VibGUtTkUucG5nXCIsXG4gIFwidGhyZWVMYXNlcnNORVwiOiBcIi9pbWcvbGFzZXItdHJpcGxlLU5FLnBuZ1wiLFxuXG4gIC8vaW1hZ2VzIHJlbGF0ZWQgdG8gbGFzZXJzIHRoYXQgYXJlIG9uIHRoZSBzb3V0aCBvciB3ZXN0IHdhbGxzLFxuICBcIm9uZUxhc2VyU1dcIjogXCIvaW1nL2xhc2VyLXNpbmdsZS1TVy5wbmdcIixcbiAgXCJ0d29MYXNlcnNTV1wiOiBcIi9pbWcvbGFzZXItZG91YmxlLVNXLnBuZ1wiLFxuICBcInRocmVlTGFzZXJzU1dcIjogXCIvaW1nL2xhc2VyLXRyaXBsZS1TVy5wbmdcIixcblxuICBtYXA6IFtcbiAgLy9yb3csIGNvbCwgZGlyZWN0aW9uLCBudW1iZXIgb2YgbGFzZXJzXG4gICAgWzAsMixcIm5vcnRoXCIsIDBdLCBbMCw0LFwibm9ydGhcIiwgMF0sIFswLDcsXCJub3J0aFwiLCAwXSwgWzAsOSxcIm5vcnRoXCIsIDBdLFxuICAgIFsyLDAsXCJ3ZXN0XCIsIDBdLCBbMiwzLFwic291dGhcIiwgMF0sIFsyLDExLFwiZWFzdFwiLCAwXSxcbiAgICBbMyw1LFwid2VzdFwiLCAwXSwgWzMsNixcImVhc3RcIiwgMV0sXG4gICAgWzQsMCxcIndlc3RcIiwgMF0sIFs0LDExLFwiZWFzdFwiLCAwXSxcbiAgICBbNSw4LFwibm9ydGhcIiwgMV0sXG4gICAgWzYsMyxcInNvdXRoXCIsIDFdLCBcbiAgICBbNywwLFwid2VzdFwiLCAwXSwgWzcsMTEsXCJlYXN0XCIsIDBdLFxuICAgIFs4LDUsXCJ3ZXN0XCIsIDFdLCBbOCw2LFwiZWFzdFwiLCAwXSxcbiAgICBbOSwwLFwid2VzdFwiLCAwXSwgWzksOCxcIm5vcnRoXCIsIDBdLCBbOSwxMSxcImVhc3RcIiwgMF0sXG4gICAgWzExLDIsXCJzb3V0aFwiLCAwXSwgWzExLDQsXCJzb3V0aFwiLCAwXSwgWzExLDcsXCJzb3V0aFwiLCAwXSwgWzExLDksXCJzb3V0aFwiLCAwXVxuICBdLFxuICBnZXRXYWxsSW1nOiBmdW5jdGlvbihjb29yZGluYXRlKSB7XG4gICAgdmFyIGRpcmVjdGlvbiA9IGNvb3JkaW5hdGVbMl07XG4gICAgdmFyIG51bUxhc2VycyA9IGNvb3JkaW5hdGVbM107XG4gICAgdmFyIGxhc2VySW1nRmlsZTtcbiAgICB2YXIgd2FsbFNyYztcblxuICAgIGlmKGRpcmVjdGlvbiA9PT0gXCJub3J0aFwiIHx8IGRpcmVjdGlvbiA9PT0gXCJlYXN0XCIpIGxhc2VySW1nRmlsZSA9IFwiTkVcIjtcbiAgICBlbHNlIGxhc2VySW1nRmlsZSA9IFwiU1dcIlxuICAgIFxuICAgIGlmIChudW1MYXNlcnMgPT09IDEpIHdhbGxTcmMgPSB3YWxsc1tcIm9uZUxhc2VyXCIgKyBsYXNlckltZ0ZpbGVdO1xuICAgIGVsc2UgaWYgKG51bUxhc2VycyA9PT0gMikgd2FsbFNyYyA9IHdhbGxzW1widHdvTGFzZXJzXCIgKyBsYXNlckltZ0ZpbGVdO1xuICAgIGVsc2UgaWYgKG51bUxhc2VycyA9PT0gMykgd2FsbFNyYyA9IHdhbGxzW1widGhyZWVMYXNlcnNcIiArIGxhc2VySW1nRmlsZV07XG4gICAgZWxzZSB3YWxsU3JjID0gd2FsbHMubm9MYXNlclxuICAgIHJldHVybiB3YWxsU3JjO1xuICB9XG59XG5cbnZhciBsYXNlcnMgPSB7XG4gIG1hcDogWyBcbiAgLy9zdGFydCwgZW5kLCB2ZXJ0aWNhbCBvciBob3Jpem9udGFsXG4gIFtbNiwzXSwgWzUsM10sIFwiaFwiXSxcbiAgW1s4LDVdLCBbOCw4XSwgXCJ2XCJdLFxuICBbWzMsNl0sIFszLDJdLCBcInZcIl0sXG4gIFtbNSw4XSwgWzYsOF0sIFwiaFwiXVxuICBdXG59XG5cbnZhciB0aWxlcyA9IHtcbiAgY29sczogMTIsXG4gIHJvd3M6IDEyLFxuICBtYXA6IFtcbiAgICAyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMixcbiAgICAyLDgsMTEsMTEsNiwyLDIsOCwxMSwxMSw2LDIsXG4gICAgMiwxMCwxOCwyLDUsMTksMiwxMCwxOCwyLDUsMixcbiAgICAyLDEwLDAsMTgsNSwyLDIsMTAsMSwxOCw1LDIsXG4gICAgMiw0LDksOSw3LDIsMTksNCw5LDksNywyLFxuICAgIDIsMiwyLDIsMTksMiwyLDIsMiwxOSwyLDIsXG4gICAgMiwyLDE5LDIsMiwyLDIsMTksMiwyLDIsMixcbiAgICAyLDgsMTEsMTEsNiwxOSwyLDgsMTEsMTEsNiwyLFxuICAgIDIsMTAsMTgsMSw1LDIsMiwxMCwxOCwwLDUsMixcbiAgICAyLDEwLDIsMTgsNSwyLDE5LDEwLDIsMTgsNSwyLFxuICAgIDIsNCw5LDksNywyLDIsNCw5LDksNywyLFxuICAgIDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyXG4gIF0sXG4gIGdldFRpbGVJbWc6IGZ1bmN0aW9uKGNvbCwgcm93KXtcbiAgICB2YXIgdGlsZUlkID0gdGhpcy5tYXBbcm93ICogdGhpcy5yb3dzICsgY29sXS50b1N0cmluZygpO1xuICAgIHZhciB0aWxlU3JjID0gdGlsZUltZ1t0aWxlSWRdLmltYWdlO1xuICAgIHJldHVybiB0aWxlU3JjO1xuICB9XG59O1xuXG5mdW5jdGlvbiBidWlsZE1hcCgpe1xuICBidWlsZFRpbGVzKCk7XG4gIGJ1aWxkV2FsbHMoKTtcbiAgZHJhd0xhc2VycygpO1xuICBkcmF3UGxheWVycyhwbGF5ZXJzLCBwbGF5ZXJzMXN0TW92ZSk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkVGlsZXMoKSB7XG4gIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRpbGVzLmNvbHM7IGNvbCArKyl7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGlsZXMucm93czsgcm93ICsrKXtcbiAgICAgIHZhciB0aWxlU3JjID0gdGlsZXMuZ2V0VGlsZUltZyhjb2wsIHJvdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8xNTB4MTUwIGlzIHRoZSBhY3R1YWwgaW1hZ2Ugc2l6ZVxuICAgICAgdmFyIHRpbGUgPSBuZXcgUElYSS5leHRyYXMuVGlsaW5nU3ByaXRlLmZyb21JbWFnZSh0aWxlU3JjLCBpbWdTaXplQWN0dWFsLCBpbWdTaXplQWN0dWFsKVxuICAgICAgXG4gICAgICB0aWxlLnBvc2l0aW9uLnggPSBpbWdTaXplKmNvbFxuICAgICAgdGlsZS5wb3NpdGlvbi55ID0gaW1nU2l6ZSpyb3c7XG4gICAgICAvL3Jlc2NhbGVzIHRoZSAxNTBweCB0aWxlIGltYWdlIHRvIGJlIDQgdGltZXMgc21hbGxlciBcbiAgICAgIHRpbGUuc2NhbGUuc2V0KDEvaW1nU2NhbGUsIDEvaW1nU2NhbGUpO1xuXG4gICAgICBzdGFnZS5hZGRDaGlsZCh0aWxlKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZFdhbGxzKCkge1xuICBmb3IodmFyIGkgPSAwOyBpIDwgd2FsbHMubWFwLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHdhbGxTcmMgPSB3YWxscy5nZXRXYWxsSW1nKHdhbGxzLm1hcFtpXSlcbiAgICB2YXIgd2FsbCA9IG5ldyBQSVhJLlNwcml0ZShQSVhJLlRleHR1cmUuZnJvbUltYWdlKHdhbGxTcmMpKVxuXG4gICAgd2FsbC5wb3NpdGlvbi54ID0gaW1nU2l6ZSp3YWxscy5tYXBbaV1bMV07XG4gICAgd2FsbC5wb3NpdGlvbi55ID0gaW1nU2l6ZSp3YWxscy5tYXBbaV1bMF07XG4gICAgd2FsbC5zY2FsZS5zZXQoMS9pbWdTY2FsZSwgMS9pbWdTY2FsZSk7XG5cbiAgICBpZih3YWxscy5tYXBbaV1bMl0gPT09IFwid2VzdFwiKSB7XG4gICAgICB3YWxsLnJvdGF0aW9uID0gTWF0aC5QSS8yXG4gICAgICBpZih3YWxscy5tYXBbaV1bM10gPiAwKSB3YWxsLnBvc2l0aW9uLnggPSB3YWxsLnBvc2l0aW9uLnggKyAzNy41XG4gICAgICBlbHNlIHdhbGwucG9zaXRpb24ueCA9IHdhbGwucG9zaXRpb24ueCArIDVcbiAgICB9IFxuICAgIGVsc2UgaWYgKHdhbGxzLm1hcFtpXVsyXSA9PT0gXCJzb3V0aFwiKSB7XG4gICAgICBpZih3YWxscy5tYXBbaV1bM10gPT09IDApIHdhbGwucG9zaXRpb24ueSA9IHdhbGwucG9zaXRpb24ueSArIGltZ1NpemUgLSA1ICAgICAgXG4gICAgfSBcbiAgICBlbHNlIGlmICh3YWxscy5tYXBbaV1bMl0gPT09IFwiZWFzdFwiKSB7XG4gICAgICB3YWxsLnJvdGF0aW9uID0gTWF0aC5QSS8yXG4gICAgICB3YWxsLnBvc2l0aW9uLnggPSB3YWxsLnBvc2l0aW9uLnggKyAzNy41ICAgICAgXG4gICAgfVxuXG4gICAgc3RhZ2UuYWRkQ2hpbGQod2FsbCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJhd0xhc2VycygpIHtcbiAgaWYobGFzZXJzKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGxhc2Vycy5tYXAubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBsaW5lID0gbmV3IFBJWEkuR3JhcGhpY3M7XG4gICAgICB2YXIgeEZyb20sIHlGcm9tLCB4VG8sIHlUbztcbiAgICAgIGlmKGxhc2Vycy5tYXBbaV1bMl0gPT09IFwiaFwiICYmIGxhc2Vycy5tYXBbaV1bMF1bMF0gPiBsYXNlcnMubWFwW2ldWzFdWzBdKSB7XG4gICAgICAgIHhGcm9tID0gbGFzZXJzLm1hcFtpXVswXVswXSArIDAuN1xuICAgICAgICB5RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMV0gKyAwLjVcbiAgICAgICAgeFRvID0gbGFzZXJzLm1hcFtpXVsxXVswXSArIDAuMVxuICAgICAgICB5VG8gPSBsYXNlcnMubWFwW2ldWzFdWzFdICsgMC41XG4gICAgICB9XG4gICAgICBlbHNlIGlmKGxhc2Vycy5tYXBbaV1bMl0gPT09IFwiaFwiKSB7XG4gICAgICAgIHhGcm9tID0gbGFzZXJzLm1hcFtpXVswXVswXSArIDAuM1xuICAgICAgICB5RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMV0gKyAwLjVcbiAgICAgICAgeFRvID0gbGFzZXJzLm1hcFtpXVsxXVswXSArIDAuOVxuICAgICAgICB5VG8gPSBsYXNlcnMubWFwW2ldWzFdWzFdICsgMC41XG4gICAgICB9XG4gICAgICBlbHNlIGlmKGxhc2Vycy5tYXBbaV1bMl0gPT09IFwidlwiICYmIGxhc2Vycy5tYXBbaV1bMF1bMV0gPiBsYXNlcnMubWFwW2ldWzFdWzFdKSB7XG4gICAgICAgIHhGcm9tID0gbGFzZXJzLm1hcFtpXVswXVswXSArIDAuNVxuICAgICAgICB5RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMV0gKyAwLjdcbiAgICAgICAgeFRvID0gbGFzZXJzLm1hcFtpXVsxXVswXSArIDAuNVxuICAgICAgICB5VG8gPSBsYXNlcnMubWFwW2ldWzFdWzFdICsgMVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHhGcm9tID0gbGFzZXJzLm1hcFtpXVswXVswXSArIDAuNVxuICAgICAgICB5RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMV0gKyAwLjFcbiAgICAgICAgeFRvID0gbGFzZXJzLm1hcFtpXVsxXVswXSArIDAuNVxuICAgICAgICB5VG8gPSBsYXNlcnMubWFwW2ldWzFdWzFdICsgMVxuICAgICAgfVxuXG4gICAgICBsaW5lLmxpbmVTdHlsZSgxLCAweGZmMDAwMClcbiAgICAgIGxpbmUubW92ZVRvKHhGcm9tKjM3LjUsIHlGcm9tKjM3LjUpXG4gICAgICBsaW5lLmxpbmVUbyh4VG8qMzcuNSwgeVRvKjM3LjUpXG5cbiAgICAgIHN0YWdlLmFkZENoaWxkKGxpbmUpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXQoKXtcbiAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcbn1cblxuXG5cblxuLy8gdmFyIGdhbWVTdGF0ZSA9IHBsYXk7XG5cbnZhciByb2JvdEltZ3MgPSB7XG4gIC8vcm9ib3QgbmFtZTogcm9ib3QgaW1hZ2UgcGF0aFxuICBcImdyZWVuXCI6IFwiL2ltZy9yb2JvdHMvcm9ib3RfMC5wbmdcIixcbiAgXCJibHVlXCI6IFwiL2ltZy9yb2JvdHMvcm9ib3RfMS5wbmdcIixcbiAgXCJ5ZWxsb3dcIjogXCIvaW1nL3JvYm90cy9yb2JvdF8yLnBuZ1wiLFxuICBnZXRSb2JvdEltZzogZnVuY3Rpb24ocm9ib3ROYW1lKSB7XG4gICAgcmV0dXJuIHJvYm90SW1nc1tyb2JvdE5hbWVdXG4gIH1cbn1cblxudmFyIHBsYXllcjEsIHBsYXllcjIsIHBsYXllcjM7XG4vL3NlZWQgZm9yIG9yaWdpbmFsIGxvY2F0aW9uXG52YXIgcGxheWVycyA9IFtcbiAgeyBwbGF5ZXI6IFwicGxheWVyMVwiLCBsb2NhdGlvbjogWzAsMTFdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJncmVlblwiLCBwcmlvcml0eVZhbDogbnVsbCB9LFxuICB7IHBsYXllcjogXCJwbGF5ZXIyXCIsIGxvY2F0aW9uOiBbMiwxMV0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcImJsdWVcIiwgcHJpb3JpdHlWYWw6IG51bGwgfSxcbiAgeyBwbGF5ZXI6IFwicGxheWVyM1wiLCBsb2NhdGlvbjogWzQsMTFdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJ5ZWxsb3dcIiwgcHJpb3JpdHlWYWw6IG51bGwgfSxcbl1cblxuLy9zZWVkIGZvciBzZWNvbmQgbG9jYXRpb25cbnZhciBwbGF5ZXJzMXN0TW92ZSA9IFtcbiAgeyBwbGF5ZXI6IFwicGxheWVyMVwiLCBsb2NhdGlvbjogWzAsOV0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcImdyZWVuXCIsIHByaW9yaXR5VmFsOiA1MDAgfSxcbiAgeyBwbGF5ZXI6IFwicGxheWVyMlwiLCBsb2NhdGlvbjogWzIsN10sIGJlYXJpbmc6IFsxLCAwXSwgcm9ib3Q6IFwiYmx1ZVwiLCBwcmlvcml0eVZhbDogMjAwIH0sXG4gIHsgcGxheWVyOiBcInBsYXllcjNcIiwgbG9jYXRpb246IFs0LDhdLCBiZWFyaW5nOiBbMCwgMV0sIHJvYm90OiBcInllbGxvd1wiLCBwcmlvcml0eVZhbDogODAwIH0sXG5dXG5cbmZ1bmN0aW9uIHNvcnRJbnRpYWxEZXN0aW5hdGlvbihpbml0aWFsLCBzb3J0ZWREZXN0aW5hdGlvbikge1xuICB2YXIgc29ydGVkSW5pdGlhbCA9IFtdO1xuXG4gIGZvcih2YXIgaSA9IDA7IGkgPCBzb3J0ZWREZXN0aW5hdGlvbi5sZW5ndGg7IGkrKykge1xuICAgIGZvcih2YXIgaiA9IDA7IGogPCBpbml0aWFsLmxlbmd0aDsgaisrKSB7XG4gICAgICBpZihpbml0aWFsW2pdLnJvYm90ID09PSBzb3J0ZWREZXN0aW5hdGlvbltpXS5yb2JvdCkge1xuICAgICAgICBzb3J0ZWRJbml0aWFsLnB1c2goaW5pdGlhbFtqXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHNvcnRlZEluaXRpYWw7XG59XG5cbmZ1bmN0aW9uIGRyYXdQbGF5ZXJzKGluaXRpYWwsIGRlc3RpbmF0aW9uKSB7XG4gIHZhciBzb3J0ZWREZXN0aW5hdGlvbiA9IHNvcnRQbGF5ZXJzQnlQcmlvcml0eShkZXN0aW5hdGlvbik7XG4gIGNvbnNvbGUubG9nKHNvcnRlZERlc3RpbmF0aW9uKVxuXG4gIHZhciBzb3J0ZWRJbml0aWFsID0gc29ydEludGlhbERlc3RpbmF0aW9uKGluaXRpYWwsIHNvcnRlZERlc3RpbmF0aW9uKTtcbiAgY29uc29sZS5sb2coJ3NvcnRlZCBpbml0aWFsIGluIHRoZSBkcmF3cGxheWVycyBmbmMnLCBzb3J0ZWRJbml0aWFsKVxuICBzb3J0ZWRJbml0aWFsLmZvckVhY2goZnVuY3Rpb24ocGxheWVyLCBpZHgpe1xuXG4gICAgc2V0VGltZW91dChkb1NvbWV0aGluZy5iaW5kKG51bGwsIHBsYXllciksIGlkeCoyMDAwKTtcblxuXG4gICAgICBmdW5jdGlvbiBkb1NvbWV0aGluZygpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciByb2JvdEltZyA9IHJvYm90SW1ncy5nZXRSb2JvdEltZyhwbGF5ZXIucm9ib3QpO1xuICAgICAgICB2YXIgcm9ib3QgPSBuZXcgUElYSS5TcHJpdGUoUElYSS5UZXh0dXJlLmZyb21JbWFnZShyb2JvdEltZykpO1xuICAgICAgICByb2JvdC5wb3NpdGlvbi54ID0gaW1nU2l6ZSpwbGF5ZXIubG9jYXRpb25bMF07XG4gICAgICAgIHJvYm90LnBvc2l0aW9uLnkgPSBpbWdTaXplKnBsYXllci5sb2NhdGlvblsxXTtcbiAgICAgICAgcm9ib3Quc2NhbGUuc2V0KDEvaW1nU2NhbGUsIDEvaW1nU2NhbGUpO1xuXG4gICAgICAgIHN0YWdlLmFkZENoaWxkKHJvYm90KTtcblxuICAgICAgICBtb3ZlUGxheWVyKClcblxuICAgICAgICBmdW5jdGlvbiBtb3ZlUGxheWVyKCkge1xuICAgICAgICAgIGlmKHJvYm90LnBvc2l0aW9uLnkgPj0gaW1nU2l6ZSpzb3J0ZWREZXN0aW5hdGlvbltpZHhdLmxvY2F0aW9uWzFdKSB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZVBsYXllcik7XG4gICAgICAgICAgICByb2JvdC5wb3NpdGlvbi55IC09IDE7XG4gICAgICAgICAgICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICAgIH1cblxuICB9KVxuICAgIC8vIG1vdmVQbGF5ZXIoKTtcbn1cbi8vIGZ1bmN0aW9uIGRyYXdQbGF5ZXJzKGludGlhbCwgZGVzdGluYXRpb24pIHtcbi8vICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcil7XG4gICAgXG4vLyAgIH0pXG4vLyB9XG5cblxuZnVuY3Rpb24gc29ydFBsYXllcnNCeVByaW9yaXR5IChhcnJPZlBsYXllck9iamVjdHMpIHtcbiAgcmV0dXJuIGFyck9mUGxheWVyT2JqZWN0cy5zb3J0KGZ1bmN0aW9uKGEsYikge1xuICAgIHJldHVybiBiLnByaW9yaXR5VmFsIC0gYS5wcmlvcml0eVZhbFxuICB9KVxufVxuXG5idWlsZE1hcCgpO1xuXG5cblxuLy8gZnVuY3Rpb24gZHJhd1BsYXllcnMoaW5pdGlhbCwgZGVzdGluYXRpb24pIHtcbi8vICAgaW5pdGlhbC5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllciwgaWR4KXtcbi8vICAgICB2YXIgcm9ib3RJbWcgPSByb2JvdEltZ3MuZ2V0Um9ib3RJbWcocGxheWVyLnJvYm90KTtcbi8vICAgICB2YXIgcm9ib3QgPSBuZXcgUElYSS5TcHJpdGUoUElYSS5UZXh0dXJlLmZyb21JbWFnZShyb2JvdEltZykpO1xuLy8gICAgIHJvYm90LnBvc2l0aW9uLnggPSBpbWdTaXplKnBsYXllci5sb2NhdGlvblswXTtcbi8vICAgICByb2JvdC5wb3NpdGlvbi55ID0gaW1nU2l6ZSpwbGF5ZXIubG9jYXRpb25bMV07XG4vLyAgICAgcm9ib3Quc2NhbGUuc2V0KDEvaW1nU2NhbGUsIDEvaW1nU2NhbGUpO1xuXG4vLyAgICAgc3RhZ2UuYWRkQ2hpbGQocm9ib3QpO1xuXG4vLyAgICAgbW92ZVBsYXllcigpXG5cbi8vICAgICBmdW5jdGlvbiBtb3ZlUGxheWVyKCkge1xuLy8gICAgICAgaWYocm9ib3QucG9zaXRpb24ueSA+PSBpbWdTaXplKmRlc3RpbmF0aW9uW2lkeF0ubG9jYXRpb25bMV0pIHtcbi8vICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmVQbGF5ZXIpO1xuLy8gICAgICAgICByb2JvdC5wb3NpdGlvbi55IC09IDE7XG4vLyAgICAgICAgIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9KVxuXG4vLyAgICAgLy8gbW92ZVBsYXllcigpO1xuLy8gfVxuIiwiYXBwLmRpcmVjdGl2ZSgnZnVsbHN0YWNrTG9nbycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmh0bWwnXG4gICAgfTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnSG9tZScsIHN0YXRlOiAnaG9tZScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQWJvdXQnLCBzdGF0ZTogJ2xvYmJ5JyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdEb2N1bWVudGF0aW9uJywgc3RhdGU6ICdkb2NzJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdNZW1iZXJzIE9ubHknLCBzdGF0ZTogJ21lbWJlcnNPbmx5JywgYXV0aDogdHJ1ZSB9XG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
