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

app.controller("LobbyController", function ($scope, FirebaseFactory) {

    var testkey = '1234';

    $scope.localConnection = FirebaseFactory.getConnection(testkey + '/game' + '/1');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJkb2NzL2RvY3MuanMiLCJob21lL2hvbWUuanMiLCJsb2JieS9sb2JieS5jb250cm9sbGVyLmpzIiwibG9iYnkvbG9iYnkuc3RhdGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsIm1lbWJlcnMtb25seS9tZW1iZXJzLW9ubHkuanMiLCJjb21tb24vZmFjdG9yaWVzL0ZpcmViYXNlRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRnVsbHN0YWNrUGljcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUmFuZG9tR3JlZXRpbmdzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYm9hcmQvYnVpbGQtYm9hcmQtZGlyZWN0aXZlLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYm9hcmQvc3RyZWFtbGluZWQuanMiLCJjb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBOztBQUVBLHFCQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7QUFHQSxHQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7OztBQUdBLFFBQUEsNEJBQUEsR0FBQSxTQUFBLDRCQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBO0tBQ0EsQ0FBQTs7OztBQUlBLGNBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBOztBQUVBLFlBQUEsQ0FBQSw0QkFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBOzs7QUFHQSxtQkFBQTtTQUNBOztBQUVBLFlBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxFQUFBOzs7QUFHQSxtQkFBQTtTQUNBOzs7QUFHQSxhQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7Ozs7QUFJQSxnQkFBQSxJQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDbERBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7OztBQUdBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxpQkFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQTs7O0FBR0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDaEJBLENBQUEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBOzs7O0FBSUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsVUFBQSxLQUFBLElBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7Ozs7O0FBS0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7O0FDcElBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsT0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDTEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMQSxHQUFBLENBQUEsVUFBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsZUFBQSxFQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsZUFBQSxHQUFBLGVBQUEsQ0FBQSxhQUFBLENBQUEsT0FBQSxHQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ05BLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDTkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7QUFDQSxrQkFBQSxFQUFBLFdBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBRUEsY0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSw0QkFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQzNCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxlQUFBO0FBQ0EsZ0JBQUEsRUFBQSxtRUFBQTtBQUNBLGtCQUFBLEVBQUEsb0JBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7OztBQUdBLFlBQUEsRUFBQTtBQUNBLHdCQUFBLEVBQUEsSUFBQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsUUFBQSxHQUFBLFNBQUEsUUFBQSxHQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxRQUFBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQy9CQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxlQUFBLEVBQUE7O0FBRUEsUUFBQSxlQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBLGdEQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLGVBQUEsR0FBQSxlQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxlQUFBLGVBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQSxlQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNiQSxHQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQSxDQUNBLHVEQUFBLEVBQ0EscUhBQUEsRUFDQSxpREFBQSxFQUNBLGlEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsQ0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQzdCQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTs7QUFFQSxRQUFBLGtCQUFBLEdBQUEsU0FBQSxrQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLFNBQUEsR0FBQSxDQUNBLGVBQUEsRUFDQSx1QkFBQSxFQUNBLHNCQUFBLEVBQ0EsdUJBQUEsRUFDQSx5REFBQSxFQUNBLDBDQUFBLEVBQ0EsY0FBQSxFQUNBLHVCQUFBLEVBQ0EsSUFBQSxFQUNBLGlDQUFBLEVBQ0EsMERBQUEsRUFDQSw2RUFBQSxDQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGlCQUFBLEVBQUEsU0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxrQkFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQzVCQSxHQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsRUFBQSxZQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLDhDQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDWEEsTUFBQSxDQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQTs7QUFFQSxJQUFBLEtBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBOzs7QUFHQSxJQUFBLGFBQUEsR0FBQSxHQUFBLENBQUE7OztBQUdBLElBQUEsUUFBQSxHQUFBLENBQUEsQ0FBQTs7QUFFQSxJQUFBLE9BQUEsR0FBQSxhQUFBLEdBQUEsUUFBQSxDQUFBOztBQUVBLElBQUEsT0FBQSxHQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLGlCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsaUJBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSxnQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLGVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLCtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsNEJBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsOEJBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSwrQkFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLDhCQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsc0JBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSxzQkFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsbUNBQUEsRUFBQTtDQUNBLENBQUE7O0FBRUEsSUFBQSxLQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsZUFBQTs7O0FBR0EsZ0JBQUEsRUFBQSwwQkFBQTtBQUNBLGlCQUFBLEVBQUEsMEJBQUE7QUFDQSxtQkFBQSxFQUFBLDBCQUFBOzs7QUFHQSxnQkFBQSxFQUFBLDBCQUFBO0FBQ0EsaUJBQUEsRUFBQSwwQkFBQTtBQUNBLG1CQUFBLEVBQUEsMEJBQUE7O0FBRUEsT0FBQSxFQUFBOztBQUVBLEtBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUNBO0FBQ0EsY0FBQSxFQUFBLG9CQUFBLFVBQUEsRUFBQTtBQUNBLFlBQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxPQUFBLENBQUE7O0FBRUEsWUFBQSxTQUFBLEtBQUEsT0FBQSxJQUFBLFNBQUEsS0FBQSxNQUFBLEVBQUEsWUFBQSxHQUFBLElBQUEsQ0FBQSxLQUNBLFlBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsWUFBQSxTQUFBLEtBQUEsQ0FBQSxFQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFlBQUEsQ0FBQSxDQUFBLEtBQ0EsSUFBQSxTQUFBLEtBQUEsQ0FBQSxFQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLFlBQUEsQ0FBQSxDQUFBLEtBQ0EsSUFBQSxTQUFBLEtBQUEsQ0FBQSxFQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsYUFBQSxHQUFBLFlBQUEsQ0FBQSxDQUFBLEtBQ0EsT0FBQSxHQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxlQUFBLE9BQUEsQ0FBQTtLQUNBO0NBQ0EsQ0FBQTs7QUFFQSxJQUFBLE1BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQTs7QUFFQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUNBO0NBQ0EsQ0FBQTs7QUFFQSxJQUFBLEtBQUEsR0FBQTtBQUNBLFFBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsQ0FDQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFDQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FDQTtBQUNBLGNBQUEsRUFBQSxvQkFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsT0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxlQUFBLE9BQUEsQ0FBQTtLQUNBO0NBQ0EsQ0FBQTs7QUFFQSxTQUFBLFFBQUEsR0FBQTtBQUNBLGNBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxPQUFBLEVBQUEsY0FBQSxDQUFBLENBQUE7Q0FDQTs7QUFFQSxTQUFBLFVBQUEsR0FBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7O0FBRUEsZ0JBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxDQUFBLENBQUE7O0FBRUEsZ0JBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQTs7QUFFQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsUUFBQSxDQUFBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBO0NBQ0E7O0FBRUEsU0FBQSxVQUFBLEdBQUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxZQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxRQUFBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsS0FDQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7U0FDQSxNQUNBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxPQUFBLEVBQUE7QUFDQSxnQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBO1NBQ0EsTUFDQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0E7O0FBRUEsYUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtLQUNBO0NBQ0E7O0FBRUEsU0FBQSxVQUFBLEdBQUE7QUFDQSxRQUFBLE1BQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLGdCQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBLGdCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLHFCQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxxQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsbUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7YUFDQSxNQUNBLElBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxxQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EscUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxtQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO2FBQ0EsTUFDQSxJQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLHFCQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxxQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsbUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7YUFDQSxNQUNBO0FBQ0EscUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHFCQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxtQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsbUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTthQUNBOztBQUVBLGdCQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLEVBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBO0NBQ0E7O0FBRUEsU0FBQSxJQUFBLEdBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0NBQ0E7Ozs7QUFPQSxJQUFBLFNBQUEsR0FBQTs7QUFFQSxXQUFBLEVBQUEseUJBQUE7QUFDQSxVQUFBLEVBQUEseUJBQUE7QUFDQSxZQUFBLEVBQUEseUJBQUE7QUFDQSxlQUFBLEVBQUEscUJBQUEsU0FBQSxFQUFBO0FBQ0EsZUFBQSxTQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7S0FDQTtDQUNBLENBQUE7O0FBRUEsSUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsQ0FBQTs7QUFFQSxJQUFBLE9BQUEsR0FBQSxDQUNBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLEVBQ0EsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsRUFDQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxDQUNBLENBQUE7OztBQUdBLElBQUEsY0FBQSxHQUFBLENBQ0EsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsQ0FDQSxDQUFBOztBQUVBLFNBQUEscUJBQUEsQ0FBQSxPQUFBLEVBQUEsaUJBQUEsRUFBQTtBQUNBLFFBQUEsYUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxTQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsaUJBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLEtBQUEsaUJBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSw2QkFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0E7S0FDQTtBQUNBLFdBQUEsYUFBQSxDQUFBO0NBQ0E7O0FBRUEsU0FBQSxXQUFBLENBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFFBQUEsaUJBQUEsR0FBQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxhQUFBLEdBQUEscUJBQUEsQ0FBQSxPQUFBLEVBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLEdBQUEsQ0FBQSx1Q0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBO0FBQ0EsaUJBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBOztBQUdBLGlCQUFBLFdBQUEsR0FBQTs7QUFFQSxnQkFBQSxRQUFBLEdBQUEsU0FBQSxDQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxLQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxpQkFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsUUFBQSxDQUFBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7O0FBRUEsc0JBQUEsRUFBQSxDQUFBOztBQUVBLHFCQUFBLFVBQUEsR0FBQTtBQUNBLG9CQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxJQUFBLE9BQUEsR0FBQSxpQkFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLHlDQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSx5QkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsNEJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7aUJBQ0E7YUFDQTtTQUNBO0tBRUEsQ0FBQSxDQUFBOztDQUVBOzs7Ozs7O0FBUUEsU0FBQSxxQkFBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxXQUFBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxDQUFBLFdBQUEsR0FBQSxDQUFBLENBQUEsV0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0E7O0FBRUEsUUFBQSxFQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdlNBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLHlDQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBOztBQUVBLGlCQUFBLENBQUEsS0FBQSxHQUFBLENBQ0EsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsY0FBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSwyQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsMEJBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSwyQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLHlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsbUJBQUEsRUFBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtTQUVBOztLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZScsICdmaXJlYmFzZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgICAgdXJsOiAnL2Fib3V0JyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0Q29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYWJvdXQvYWJvdXQuaHRtbCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBYm91dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBGdWxsc3RhY2tQaWNzKSB7XG5cbiAgICAvLyBJbWFnZXMgb2YgYmVhdXRpZnVsIEZ1bGxzdGFjayBwZW9wbGUuXG4gICAgJHNjb3BlLmltYWdlcyA9IF8uc2h1ZmZsZShGdWxsc3RhY2tQaWNzKTtcblxufSk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ1NvY2tldCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbiAoJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbiAoZnJvbVNlcnZlcikge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcbiAgICAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb2NzJywge1xuICAgICAgICB1cmw6ICcvZG9jcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG9jcy9kb2NzLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJ1xuICAgIH0pO1xufSk7IiwiYXBwLmNvbnRyb2xsZXIoXCJMb2JieUNvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHNjb3BlLCBGaXJlYmFzZUZhY3RvcnkpIHtcblxuXHR2YXIgdGVzdGtleSA9ICcxMjM0J1xuXG5cdCRzY29wZS5sb2NhbENvbm5lY3Rpb24gPSBGaXJlYmFzZUZhY3RvcnkuZ2V0Q29ubmVjdGlvbih0ZXN0a2V5ICsgJy9nYW1lJyArICcvMScpXG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2JieScsIHtcblx0XHR1cmw6ICcvbG9iYnknLFxuXHRcdGNvbnRyb2xsZXI6ICdMb2JieUNvbnRyb2xsZXInLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvbG9iYnkvbG9iYnkuaHRtbCdcblx0fSlcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgJHNjb3BlLnNlbmRMb2dpbiA9IGZ1bmN0aW9uIChsb2dpbkluZm8pIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luSW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ21lbWJlcnNPbmx5Jywge1xuICAgICAgICB1cmw6ICcvbWVtYmVycy1hcmVhJyxcbiAgICAgICAgdGVtcGxhdGU6ICc8aW1nIG5nLXJlcGVhdD1cIml0ZW0gaW4gc3Rhc2hcIiB3aWR0aD1cIjMwMFwiIG5nLXNyYz1cInt7IGl0ZW0gfX1cIiAvPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsIFNlY3JldFN0YXNoKSB7XG4gICAgICAgICAgICBTZWNyZXRTdGFzaC5nZXRTdGFzaCgpLnRoZW4oZnVuY3Rpb24gKHN0YXNoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXNoID0gc3Rhc2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBkYXRhLmF1dGhlbnRpY2F0ZSBpcyByZWFkIGJ5IGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIC8vIHRoYXQgY29udHJvbHMgYWNjZXNzIHRvIHRoaXMgc3RhdGUuIFJlZmVyIHRvIGFwcC5qcy5cbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdTZWNyZXRTdGFzaCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgdmFyIGdldFN0YXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvc2VjcmV0LXN0YXNoJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3Rhc2g6IGdldFN0YXNoXG4gICAgfTtcblxufSk7IiwiYXBwLmZhY3RvcnkoJ0ZpcmViYXNlRmFjdG9yeScsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCkge1xuXG5cdHZhciBGaXJlYmFzZUZhY3RvcnkgPSB7fTtcblxuXHR2YXIgYmFzZVVybCA9IFwiaHR0cHM6Ly9yZXNwbGVuZGVudC10b3JjaC00MzIyLmZpcmViYXNlaW8uY29tL1wiO1xuXG5cdEZpcmViYXNlRmFjdG9yeS5nZXRDb25uZWN0aW9uID0gZnVuY3Rpb24oa2V5KSB7XG5cdFx0dmFyIGxvY2FsQ29ubmVjdGlvbiA9ICRmaXJlYmFzZU9iamVjdChuZXcgRmlyZWJhc2UoYmFzZVVybCArIGtleSkpXG5cdFx0cmV0dXJuIGxvY2FsQ29ubmVjdGlvblxuXHR9XG5cblx0cmV0dXJuIEZpcmViYXNlRmFjdG9yeVxuXG59KSIsImFwcC5mYWN0b3J5KCdGdWxsc3RhY2tQaWNzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBbXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjdnQlh1bENBQUFYUWNFLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL2ZiY2RuLXNwaG90b3MtYy1hLmFrYW1haWhkLm5ldC9ocGhvdG9zLWFrLXhhcDEvdDMxLjAtOC8xMDg2MjQ1MV8xMDIwNTYyMjk5MDM1OTI0MV84MDI3MTY4ODQzMzEyODQxMTM3X28uanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLUxLVXNoSWdBRXk5U0suanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNzktWDdvQ01BQWt3N3kuanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLVVqOUNPSUlBSUZBaDAuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNnlJeUZpQ0VBQXFsMTIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRS1UNzVsV0FBQW1xcUouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRXZaQWctVkFBQWs5MzIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRWdOTWVPWElBSWZEaEsuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRVF5SUROV2dBQXU2MEIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQ0YzVDVRVzhBRTJsR0ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWVWdzVTV29BQUFMc2ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWFKSVA3VWtBQWxJR3MuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQVFPdzlsV0VBQVk5RmwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLU9RYlZyQ01BQU53SU0uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9COWJfZXJ3Q1lBQXdSY0oucG5nOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNVBUZHZuQ2NBRUFsNHguanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNHF3QzBpQ1lBQWxQR2guanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CMmIzM3ZSSVVBQTlvMUQuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cd3BJd3IxSVVBQXZPMl8uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cc1NzZUFOQ1lBRU9oTHcuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSjR2TGZ1VXdBQWRhNEwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSTd3empFVkVBQU9QcFMuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSWRIdlQyVXNBQW5uSFYuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DR0NpUF9ZV1lBQW83NVYuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSVM0SlBJV0lBSTM3cXUuanBnOmxhcmdlJ1xuICAgIF07XG59KTtcbiIsImFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxuICAgICAgICAnQXQgbG9uZyBsYXN0LCBJIGxpdmUhJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciBwcm9qZWN0LCBleGNlcHQgdGhhdCBJIGFtIHlvdXJzLiA6KScsXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJyxcbiAgICAgICAgJ+OBk+OCk+OBq+OBoeOBr+OAgeODpuODvOOCtuODvOanmOOAgicsXG4gICAgICAgICdXZWxjb21lLiBUby4gV0VCU0lURS4nLFxuICAgICAgICAnOkQnLFxuICAgICAgICAnWWVzLCBJIHRoaW5rIHdlXFwndmUgbWV0IGJlZm9yZS4nLFxuICAgICAgICAnR2ltbWUgMyBtaW5zLi4uIEkganVzdCBncmFiYmVkIHRoaXMgcmVhbGx5IGRvcGUgZnJpdHRhdGEnLFxuICAgICAgICAnSWYgQ29vcGVyIGNvdWxkIG9mZmVyIG9ubHkgb25lIHBpZWNlIG9mIGFkdmljZSwgaXQgd291bGQgYmUgdG8gbmV2U1FVSVJSRUwhJyxcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXG4gICAgICAgIGdldFJhbmRvbUdyZWV0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTtcbiIsImFwcC5kaXJlY3RpdmUoJ2J1aWxkQm9hcmQnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9jb21tb24vZGlyZWN0aXZlcy9ib2FyZC9idWlsZC1ib2FyZC5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgXHQvL3RoaXMgZnVuY3Rpb24gY29tZXMgZnJvbSBzdHJlYW1saW5lZC5qc1xuICAgICAgICBcdHdpbmRvdy5zdGFydCgpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7Iiwid2luZG93LnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZFwiKS5hcHBlbmRDaGlsZChyZW5kZXJlci52aWV3KTtcbn1cblxudmFyIHN0YWdlID0gbmV3IFBJWEkuU3RhZ2UoMHg2NmZmOTkpO1xudmFyIHJlbmRlcmVyID0gbmV3IFBJWEkuQ2FudmFzUmVuZGVyZXIoNDUwLDQ1MCk7XG5cbi8vYWxsIGltYWdlIGZpbGVzIGFyZSAxNTBweC4gRG8gbm90IGNoYW5nZSB0aGlzIG51bWJlciFcbnZhciBpbWdTaXplQWN0dWFsID0gMTUwIFxuXG4vL2ZhY3RvciB0byByZXNjYWxlIGltYWdlcyBieS4gVGhpcyBudW1iZXIgY2FuIGJlIGNoYW5nZWRcbnZhciBpbWdTY2FsZSA9IDQgXG5cbnZhciBpbWdTaXplID0gaW1nU2l6ZUFjdHVhbC9pbWdTY2FsZVxuXG52YXIgdGlsZUltZyA9IHtcblwiMFwiOiB7XCJpbWFnZVwiOlwiL2ltZy9yZXBhaXIuanBnXCJ9LFxuXCIxXCI6IHtcImltYWdlXCI6XCIvaW1nL29wdGlvbi5qcGdcIn0sXG5cIjJcIjoge1wiaW1hZ2VcIjpcIi9pbWcvZW1wdHkuanBnXCJ9LFxuXCIzXCI6IHtcImltYWdlXCI6XCIvaW1nL3ZvaWQuanBnXCJ9LFxuXCI0XCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1leHByZXNzLXduLmpwZ1wifSxcblwiNVwiOiB7XCJpbWFnZVwiOlwiL2ltZy9yb2xsZXItZXhwcmVzcy1zb3V0aC5qcGdcIn0sXG5cIjZcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcm9sbGVyLWV4cHJlc3MtZXMuanBnXCJ9LFxuXCI3XCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1leHByZXNzLXN3LmpwZ1wifSxcblwiOFwiOiB7XCJpbWFnZVwiOlwiL2ltZy9yb2xsZXItZXhwcmVzcy1zZS5qcGdcIn0sXG5cIjlcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcm9sbGVyLWV4cHJlc3Mtd2VzdC5qcGdcIn0sXG5cIjEwXCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1leHByZXNzLW5vcnRoLmpwZ1wifSxcblwiMTFcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcm9sbGVyLWV4cHJlc3MtZWFzdC5qcGdcIn0sXG5cIjEyXCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1lYXN0LnBuZ1wifSxcblwiMTNcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcm9sbGVyLXdlc3QucG5nXCJ9LFxuXCIxOFwiOiB7XCJpbWFnZVwiOlwiL2ltZy9zcGlubmVyLWNsb2Nrd2lzZS5qcGdcIn0sXG5cIjE5XCI6IHtcImltYWdlXCI6XCIvaW1nL3NwaW5uZXItY291bnRlcmNsb2Nrd2lzZS5qcGdcIn1cbn07XG5cbnZhciB3YWxscyA9IHtcbiAgXCJub0xhc2VyXCI6IFwiL2ltZy93YWxsLnBuZ1wiLFxuXG4gIC8vaW1hZ2VzIHJlbGF0ZWQgdG8gbGFzZXJzIHRoYXQgYXJlIG9uIHRoZSBub3J0aCBvciBlYXN0IHdhbGxzXG4gIFwib25lTGFzZXJORVwiOiBcIi9pbWcvbGFzZXItc2luZ2xlLU5FLnBuZ1wiLFxuICBcInR3b0xhc2Vyc05FXCI6IFwiL2ltZy9sYXNlci1kb3VibGUtTkUucG5nXCIsXG4gIFwidGhyZWVMYXNlcnNORVwiOiBcIi9pbWcvbGFzZXItdHJpcGxlLU5FLnBuZ1wiLFxuXG4gIC8vaW1hZ2VzIHJlbGF0ZWQgdG8gbGFzZXJzIHRoYXQgYXJlIG9uIHRoZSBzb3V0aCBvciB3ZXN0IHdhbGxzLFxuICBcIm9uZUxhc2VyU1dcIjogXCIvaW1nL2xhc2VyLXNpbmdsZS1TVy5wbmdcIixcbiAgXCJ0d29MYXNlcnNTV1wiOiBcIi9pbWcvbGFzZXItZG91YmxlLVNXLnBuZ1wiLFxuICBcInRocmVlTGFzZXJzU1dcIjogXCIvaW1nL2xhc2VyLXRyaXBsZS1TVy5wbmdcIixcblxuICBtYXA6IFtcbiAgLy9yb3csIGNvbCwgZGlyZWN0aW9uLCBudW1iZXIgb2YgbGFzZXJzXG4gICAgWzAsMixcIm5vcnRoXCIsIDBdLCBbMCw0LFwibm9ydGhcIiwgMF0sIFswLDcsXCJub3J0aFwiLCAwXSwgWzAsOSxcIm5vcnRoXCIsIDBdLFxuICAgIFsyLDAsXCJ3ZXN0XCIsIDBdLCBbMiwzLFwic291dGhcIiwgMF0sIFsyLDExLFwiZWFzdFwiLCAwXSxcbiAgICBbMyw1LFwid2VzdFwiLCAwXSwgWzMsNixcImVhc3RcIiwgMV0sXG4gICAgWzQsMCxcIndlc3RcIiwgMF0sIFs0LDExLFwiZWFzdFwiLCAwXSxcbiAgICBbNSw4LFwibm9ydGhcIiwgMV0sXG4gICAgWzYsMyxcInNvdXRoXCIsIDFdLCBcbiAgICBbNywwLFwid2VzdFwiLCAwXSwgWzcsMTEsXCJlYXN0XCIsIDBdLFxuICAgIFs4LDUsXCJ3ZXN0XCIsIDFdLCBbOCw2LFwiZWFzdFwiLCAwXSxcbiAgICBbOSwwLFwid2VzdFwiLCAwXSwgWzksOCxcIm5vcnRoXCIsIDBdLCBbOSwxMSxcImVhc3RcIiwgMF0sXG4gICAgWzExLDIsXCJzb3V0aFwiLCAwXSwgWzExLDQsXCJzb3V0aFwiLCAwXSwgWzExLDcsXCJzb3V0aFwiLCAwXSwgWzExLDksXCJzb3V0aFwiLCAwXVxuICBdLFxuICBnZXRXYWxsSW1nOiBmdW5jdGlvbihjb29yZGluYXRlKSB7XG4gICAgdmFyIGRpcmVjdGlvbiA9IGNvb3JkaW5hdGVbMl07XG4gICAgdmFyIG51bUxhc2VycyA9IGNvb3JkaW5hdGVbM107XG4gICAgdmFyIGxhc2VySW1nRmlsZTtcbiAgICB2YXIgd2FsbFNyYztcblxuICAgIGlmKGRpcmVjdGlvbiA9PT0gXCJub3J0aFwiIHx8IGRpcmVjdGlvbiA9PT0gXCJlYXN0XCIpIGxhc2VySW1nRmlsZSA9IFwiTkVcIjtcbiAgICBlbHNlIGxhc2VySW1nRmlsZSA9IFwiU1dcIlxuICAgIFxuICAgIGlmIChudW1MYXNlcnMgPT09IDEpIHdhbGxTcmMgPSB3YWxsc1tcIm9uZUxhc2VyXCIgKyBsYXNlckltZ0ZpbGVdO1xuICAgIGVsc2UgaWYgKG51bUxhc2VycyA9PT0gMikgd2FsbFNyYyA9IHdhbGxzW1widHdvTGFzZXJzXCIgKyBsYXNlckltZ0ZpbGVdO1xuICAgIGVsc2UgaWYgKG51bUxhc2VycyA9PT0gMykgd2FsbFNyYyA9IHdhbGxzW1widGhyZWVMYXNlcnNcIiArIGxhc2VySW1nRmlsZV07XG4gICAgZWxzZSB3YWxsU3JjID0gd2FsbHMubm9MYXNlclxuICAgIHJldHVybiB3YWxsU3JjO1xuICB9XG59XG5cbnZhciBsYXNlcnMgPSB7XG4gIG1hcDogWyBcbiAgLy9zdGFydCwgZW5kLCB2ZXJ0aWNhbCBvciBob3Jpem9udGFsXG4gIFtbNiwzXSwgWzUsM10sIFwiaFwiXSxcbiAgW1s4LDVdLCBbOCw4XSwgXCJ2XCJdLFxuICBbWzMsNl0sIFszLDJdLCBcInZcIl0sXG4gIFtbNSw4XSwgWzYsOF0sIFwiaFwiXVxuICBdXG59XG5cbnZhciB0aWxlcyA9IHtcbiAgY29sczogMTIsXG4gIHJvd3M6IDEyLFxuICBtYXA6IFtcbiAgICAyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMixcbiAgICAyLDgsMTEsMTEsNiwyLDIsOCwxMSwxMSw2LDIsXG4gICAgMiwxMCwxOCwyLDUsMTksMiwxMCwxOCwyLDUsMixcbiAgICAyLDEwLDAsMTgsNSwyLDIsMTAsMSwxOCw1LDIsXG4gICAgMiw0LDksOSw3LDIsMTksNCw5LDksNywyLFxuICAgIDIsMiwyLDIsMTksMiwyLDIsMiwxOSwyLDIsXG4gICAgMiwyLDE5LDIsMiwyLDIsMTksMiwyLDIsMixcbiAgICAyLDgsMTEsMTEsNiwxOSwyLDgsMTEsMTEsNiwyLFxuICAgIDIsMTAsMTgsMSw1LDIsMiwxMCwxOCwwLDUsMixcbiAgICAyLDEwLDIsMTgsNSwyLDE5LDEwLDIsMTgsNSwyLFxuICAgIDIsNCw5LDksNywyLDIsNCw5LDksNywyLFxuICAgIDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyXG4gIF0sXG4gIGdldFRpbGVJbWc6IGZ1bmN0aW9uKGNvbCwgcm93KXtcbiAgICB2YXIgdGlsZUlkID0gdGhpcy5tYXBbcm93ICogdGhpcy5yb3dzICsgY29sXS50b1N0cmluZygpO1xuICAgIHZhciB0aWxlU3JjID0gdGlsZUltZ1t0aWxlSWRdLmltYWdlO1xuICAgIHJldHVybiB0aWxlU3JjO1xuICB9XG59O1xuXG5mdW5jdGlvbiBidWlsZE1hcCgpe1xuICBidWlsZFRpbGVzKCk7XG4gIGJ1aWxkV2FsbHMoKTtcbiAgZHJhd0xhc2VycygpO1xuICBkcmF3UGxheWVycyhwbGF5ZXJzLCBwbGF5ZXJzMXN0TW92ZSk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkVGlsZXMoKSB7XG4gIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRpbGVzLmNvbHM7IGNvbCArKyl7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGlsZXMucm93czsgcm93ICsrKXtcbiAgICAgIHZhciB0aWxlU3JjID0gdGlsZXMuZ2V0VGlsZUltZyhjb2wsIHJvdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8xNTB4MTUwIGlzIHRoZSBhY3R1YWwgaW1hZ2Ugc2l6ZVxuICAgICAgdmFyIHRpbGUgPSBuZXcgUElYSS5leHRyYXMuVGlsaW5nU3ByaXRlLmZyb21JbWFnZSh0aWxlU3JjLCBpbWdTaXplQWN0dWFsLCBpbWdTaXplQWN0dWFsKVxuICAgICAgXG4gICAgICB0aWxlLnBvc2l0aW9uLnggPSBpbWdTaXplKmNvbFxuICAgICAgdGlsZS5wb3NpdGlvbi55ID0gaW1nU2l6ZSpyb3c7XG4gICAgICAvL3Jlc2NhbGVzIHRoZSAxNTBweCB0aWxlIGltYWdlIHRvIGJlIDQgdGltZXMgc21hbGxlciBcbiAgICAgIHRpbGUuc2NhbGUuc2V0KDEvaW1nU2NhbGUsIDEvaW1nU2NhbGUpO1xuXG4gICAgICBzdGFnZS5hZGRDaGlsZCh0aWxlKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZFdhbGxzKCkge1xuICBmb3IodmFyIGkgPSAwOyBpIDwgd2FsbHMubWFwLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHdhbGxTcmMgPSB3YWxscy5nZXRXYWxsSW1nKHdhbGxzLm1hcFtpXSlcbiAgICB2YXIgd2FsbCA9IG5ldyBQSVhJLlNwcml0ZShQSVhJLlRleHR1cmUuZnJvbUltYWdlKHdhbGxTcmMpKVxuXG4gICAgd2FsbC5wb3NpdGlvbi54ID0gaW1nU2l6ZSp3YWxscy5tYXBbaV1bMV07XG4gICAgd2FsbC5wb3NpdGlvbi55ID0gaW1nU2l6ZSp3YWxscy5tYXBbaV1bMF07XG4gICAgd2FsbC5zY2FsZS5zZXQoMS9pbWdTY2FsZSwgMS9pbWdTY2FsZSk7XG5cbiAgICBpZih3YWxscy5tYXBbaV1bMl0gPT09IFwid2VzdFwiKSB7XG4gICAgICB3YWxsLnJvdGF0aW9uID0gTWF0aC5QSS8yXG4gICAgICBpZih3YWxscy5tYXBbaV1bM10gPiAwKSB3YWxsLnBvc2l0aW9uLnggPSB3YWxsLnBvc2l0aW9uLnggKyAzNy41XG4gICAgICBlbHNlIHdhbGwucG9zaXRpb24ueCA9IHdhbGwucG9zaXRpb24ueCArIDVcbiAgICB9IFxuICAgIGVsc2UgaWYgKHdhbGxzLm1hcFtpXVsyXSA9PT0gXCJzb3V0aFwiKSB7XG4gICAgICBpZih3YWxscy5tYXBbaV1bM10gPT09IDApIHdhbGwucG9zaXRpb24ueSA9IHdhbGwucG9zaXRpb24ueSArIGltZ1NpemUgLSA1ICAgICAgXG4gICAgfSBcbiAgICBlbHNlIGlmICh3YWxscy5tYXBbaV1bMl0gPT09IFwiZWFzdFwiKSB7XG4gICAgICB3YWxsLnJvdGF0aW9uID0gTWF0aC5QSS8yXG4gICAgICB3YWxsLnBvc2l0aW9uLnggPSB3YWxsLnBvc2l0aW9uLnggKyAzNy41ICAgICAgXG4gICAgfVxuXG4gICAgc3RhZ2UuYWRkQ2hpbGQod2FsbCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJhd0xhc2VycygpIHtcbiAgaWYobGFzZXJzKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGxhc2Vycy5tYXAubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBsaW5lID0gbmV3IFBJWEkuR3JhcGhpY3M7XG4gICAgICB2YXIgeEZyb20sIHlGcm9tLCB4VG8sIHlUbztcbiAgICAgIGlmKGxhc2Vycy5tYXBbaV1bMl0gPT09IFwiaFwiICYmIGxhc2Vycy5tYXBbaV1bMF1bMF0gPiBsYXNlcnMubWFwW2ldWzFdWzBdKSB7XG4gICAgICAgIHhGcm9tID0gbGFzZXJzLm1hcFtpXVswXVswXSArIDAuN1xuICAgICAgICB5RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMV0gKyAwLjVcbiAgICAgICAgeFRvID0gbGFzZXJzLm1hcFtpXVsxXVswXSArIDAuMVxuICAgICAgICB5VG8gPSBsYXNlcnMubWFwW2ldWzFdWzFdICsgMC41XG4gICAgICB9XG4gICAgICBlbHNlIGlmKGxhc2Vycy5tYXBbaV1bMl0gPT09IFwiaFwiKSB7XG4gICAgICAgIHhGcm9tID0gbGFzZXJzLm1hcFtpXVswXVswXSArIDAuM1xuICAgICAgICB5RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMV0gKyAwLjVcbiAgICAgICAgeFRvID0gbGFzZXJzLm1hcFtpXVsxXVswXSArIDAuOVxuICAgICAgICB5VG8gPSBsYXNlcnMubWFwW2ldWzFdWzFdICsgMC41XG4gICAgICB9XG4gICAgICBlbHNlIGlmKGxhc2Vycy5tYXBbaV1bMl0gPT09IFwidlwiICYmIGxhc2Vycy5tYXBbaV1bMF1bMV0gPiBsYXNlcnMubWFwW2ldWzFdWzFdKSB7XG4gICAgICAgIHhGcm9tID0gbGFzZXJzLm1hcFtpXVswXVswXSArIDAuNVxuICAgICAgICB5RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMV0gKyAwLjdcbiAgICAgICAgeFRvID0gbGFzZXJzLm1hcFtpXVsxXVswXSArIDAuNVxuICAgICAgICB5VG8gPSBsYXNlcnMubWFwW2ldWzFdWzFdICsgMVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHhGcm9tID0gbGFzZXJzLm1hcFtpXVswXVswXSArIDAuNVxuICAgICAgICB5RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMV0gKyAwLjFcbiAgICAgICAgeFRvID0gbGFzZXJzLm1hcFtpXVsxXVswXSArIDAuNVxuICAgICAgICB5VG8gPSBsYXNlcnMubWFwW2ldWzFdWzFdICsgMVxuICAgICAgfVxuXG4gICAgICBsaW5lLmxpbmVTdHlsZSgxLCAweGZmMDAwMClcbiAgICAgIGxpbmUubW92ZVRvKHhGcm9tKjM3LjUsIHlGcm9tKjM3LjUpXG4gICAgICBsaW5lLmxpbmVUbyh4VG8qMzcuNSwgeVRvKjM3LjUpXG5cbiAgICAgIHN0YWdlLmFkZENoaWxkKGxpbmUpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXQoKXtcbiAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcbn1cblxuXG5cblxuLy8gdmFyIGdhbWVTdGF0ZSA9IHBsYXk7XG5cbnZhciByb2JvdEltZ3MgPSB7XG4gIC8vcm9ib3QgbmFtZTogcm9ib3QgaW1hZ2UgcGF0aFxuICBcImdyZWVuXCI6IFwiL2ltZy9yb2JvdHMvcm9ib3RfMC5wbmdcIixcbiAgXCJibHVlXCI6IFwiL2ltZy9yb2JvdHMvcm9ib3RfMS5wbmdcIixcbiAgXCJ5ZWxsb3dcIjogXCIvaW1nL3JvYm90cy9yb2JvdF8yLnBuZ1wiLFxuICBnZXRSb2JvdEltZzogZnVuY3Rpb24ocm9ib3ROYW1lKSB7XG4gICAgcmV0dXJuIHJvYm90SW1nc1tyb2JvdE5hbWVdXG4gIH1cbn1cblxudmFyIHBsYXllcjEsIHBsYXllcjIsIHBsYXllcjM7XG4vL3NlZWQgZm9yIG9yaWdpbmFsIGxvY2F0aW9uXG52YXIgcGxheWVycyA9IFtcbiAgeyBwbGF5ZXI6IFwicGxheWVyMVwiLCBsb2NhdGlvbjogWzAsMTFdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJncmVlblwiLCBwcmlvcml0eVZhbDogbnVsbCB9LFxuICB7IHBsYXllcjogXCJwbGF5ZXIyXCIsIGxvY2F0aW9uOiBbMiwxMV0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcImJsdWVcIiwgcHJpb3JpdHlWYWw6IG51bGwgfSxcbiAgeyBwbGF5ZXI6IFwicGxheWVyM1wiLCBsb2NhdGlvbjogWzQsMTFdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJ5ZWxsb3dcIiwgcHJpb3JpdHlWYWw6IG51bGwgfSxcbl1cblxuLy9zZWVkIGZvciBzZWNvbmQgbG9jYXRpb25cbnZhciBwbGF5ZXJzMXN0TW92ZSA9IFtcbiAgeyBwbGF5ZXI6IFwicGxheWVyMVwiLCBsb2NhdGlvbjogWzAsOV0sIGJlYXJpbmc6IFstMSwgMF0sIHJvYm90OiBcImdyZWVuXCIsIHByaW9yaXR5VmFsOiA1MDAgfSxcbiAgeyBwbGF5ZXI6IFwicGxheWVyMlwiLCBsb2NhdGlvbjogWzIsN10sIGJlYXJpbmc6IFsxLCAwXSwgcm9ib3Q6IFwiYmx1ZVwiLCBwcmlvcml0eVZhbDogMjAwIH0sXG4gIHsgcGxheWVyOiBcInBsYXllcjNcIiwgbG9jYXRpb246IFs0LDhdLCBiZWFyaW5nOiBbMCwgMV0sIHJvYm90OiBcInllbGxvd1wiLCBwcmlvcml0eVZhbDogODAwIH0sXG5dXG5cbmZ1bmN0aW9uIHNvcnRJbnRpYWxEZXN0aW5hdGlvbihpbml0aWFsLCBzb3J0ZWREZXN0aW5hdGlvbikge1xuICB2YXIgc29ydGVkSW5pdGlhbCA9IFtdO1xuXG4gIGZvcih2YXIgaSA9IDA7IGkgPCBzb3J0ZWREZXN0aW5hdGlvbi5sZW5ndGg7IGkrKykge1xuICAgIGZvcih2YXIgaiA9IDA7IGogPCBpbml0aWFsLmxlbmd0aDsgaisrKSB7XG4gICAgICBpZihpbml0aWFsW2pdLnJvYm90ID09PSBzb3J0ZWREZXN0aW5hdGlvbltpXS5yb2JvdCkge1xuICAgICAgICBzb3J0ZWRJbml0aWFsLnB1c2goaW5pdGlhbFtqXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHNvcnRlZEluaXRpYWw7XG59XG5cbmZ1bmN0aW9uIGRyYXdQbGF5ZXJzKGluaXRpYWwsIGRlc3RpbmF0aW9uKSB7XG4gIHZhciBzb3J0ZWREZXN0aW5hdGlvbiA9IHNvcnRQbGF5ZXJzQnlQcmlvcml0eShkZXN0aW5hdGlvbik7XG4gIGNvbnNvbGUubG9nKHNvcnRlZERlc3RpbmF0aW9uKVxuXG4gIHZhciBzb3J0ZWRJbml0aWFsID0gc29ydEludGlhbERlc3RpbmF0aW9uKGluaXRpYWwsIHNvcnRlZERlc3RpbmF0aW9uKTtcbiAgY29uc29sZS5sb2coJ3NvcnRlZCBpbml0aWFsIGluIHRoZSBkcmF3cGxheWVycyBmbmMnLCBzb3J0ZWRJbml0aWFsKVxuICBzb3J0ZWRJbml0aWFsLmZvckVhY2goZnVuY3Rpb24ocGxheWVyLCBpZHgpe1xuXG4gICAgc2V0VGltZW91dChkb1NvbWV0aGluZy5iaW5kKG51bGwsIHBsYXllciksIGlkeCoyMDAwKTtcblxuXG4gICAgICBmdW5jdGlvbiBkb1NvbWV0aGluZygpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciByb2JvdEltZyA9IHJvYm90SW1ncy5nZXRSb2JvdEltZyhwbGF5ZXIucm9ib3QpO1xuICAgICAgICB2YXIgcm9ib3QgPSBuZXcgUElYSS5TcHJpdGUoUElYSS5UZXh0dXJlLmZyb21JbWFnZShyb2JvdEltZykpO1xuICAgICAgICByb2JvdC5wb3NpdGlvbi54ID0gaW1nU2l6ZSpwbGF5ZXIubG9jYXRpb25bMF07XG4gICAgICAgIHJvYm90LnBvc2l0aW9uLnkgPSBpbWdTaXplKnBsYXllci5sb2NhdGlvblsxXTtcbiAgICAgICAgcm9ib3Quc2NhbGUuc2V0KDEvaW1nU2NhbGUsIDEvaW1nU2NhbGUpO1xuXG4gICAgICAgIHN0YWdlLmFkZENoaWxkKHJvYm90KTtcblxuICAgICAgICBtb3ZlUGxheWVyKClcblxuICAgICAgICBmdW5jdGlvbiBtb3ZlUGxheWVyKCkge1xuICAgICAgICAgIGlmKHJvYm90LnBvc2l0aW9uLnkgPj0gaW1nU2l6ZSpzb3J0ZWREZXN0aW5hdGlvbltpZHhdLmxvY2F0aW9uWzFdKSB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZVBsYXllcik7XG4gICAgICAgICAgICByb2JvdC5wb3NpdGlvbi55IC09IDE7XG4gICAgICAgICAgICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICAgIH1cblxuICB9KVxuICAgIC8vIG1vdmVQbGF5ZXIoKTtcbn1cbi8vIGZ1bmN0aW9uIGRyYXdQbGF5ZXJzKGludGlhbCwgZGVzdGluYXRpb24pIHtcbi8vICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcil7XG4gICAgXG4vLyAgIH0pXG4vLyB9XG5cblxuZnVuY3Rpb24gc29ydFBsYXllcnNCeVByaW9yaXR5IChhcnJPZlBsYXllck9iamVjdHMpIHtcbiAgcmV0dXJuIGFyck9mUGxheWVyT2JqZWN0cy5zb3J0KGZ1bmN0aW9uKGEsYikge1xuICAgIHJldHVybiBiLnByaW9yaXR5VmFsIC0gYS5wcmlvcml0eVZhbFxuICB9KVxufVxuXG5idWlsZE1hcCgpO1xuXG5cblxuLy8gZnVuY3Rpb24gZHJhd1BsYXllcnMoaW5pdGlhbCwgZGVzdGluYXRpb24pIHtcbi8vICAgaW5pdGlhbC5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllciwgaWR4KXtcbi8vICAgICB2YXIgcm9ib3RJbWcgPSByb2JvdEltZ3MuZ2V0Um9ib3RJbWcocGxheWVyLnJvYm90KTtcbi8vICAgICB2YXIgcm9ib3QgPSBuZXcgUElYSS5TcHJpdGUoUElYSS5UZXh0dXJlLmZyb21JbWFnZShyb2JvdEltZykpO1xuLy8gICAgIHJvYm90LnBvc2l0aW9uLnggPSBpbWdTaXplKnBsYXllci5sb2NhdGlvblswXTtcbi8vICAgICByb2JvdC5wb3NpdGlvbi55ID0gaW1nU2l6ZSpwbGF5ZXIubG9jYXRpb25bMV07XG4vLyAgICAgcm9ib3Quc2NhbGUuc2V0KDEvaW1nU2NhbGUsIDEvaW1nU2NhbGUpO1xuXG4vLyAgICAgc3RhZ2UuYWRkQ2hpbGQocm9ib3QpO1xuXG4vLyAgICAgbW92ZVBsYXllcigpXG5cbi8vICAgICBmdW5jdGlvbiBtb3ZlUGxheWVyKCkge1xuLy8gICAgICAgaWYocm9ib3QucG9zaXRpb24ueSA+PSBpbWdTaXplKmRlc3RpbmF0aW9uW2lkeF0ubG9jYXRpb25bMV0pIHtcbi8vICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmVQbGF5ZXIpO1xuLy8gICAgICAgICByb2JvdC5wb3NpdGlvbi55IC09IDE7XG4vLyAgICAgICAgIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9KVxuXG4vLyAgICAgLy8gbW92ZVBsYXllcigpO1xuLy8gfVxuIiwiYXBwLmRpcmVjdGl2ZSgnZnVsbHN0YWNrTG9nbycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmh0bWwnXG4gICAgfTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnSG9tZScsIHN0YXRlOiAnaG9tZScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQWJvdXQnLCBzdGF0ZTogJ2xvYmJ5JyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdEb2N1bWVudGF0aW9uJywgc3RhdGU6ICdkb2NzJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdNZW1iZXJzIE9ubHknLCBzdGF0ZTogJ21lbWJlcnNPbmx5JywgYXV0aDogdHJ1ZSB9XG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
