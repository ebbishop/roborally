'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

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

            scope.items = [{ label: 'Home', state: 'home' }, { label: 'About', state: 'about' }, { label: 'Documentation', state: 'docs' }, { label: 'Members Only', state: 'membersOnly', auth: true }];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZG9jcy9kb2NzLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsIm1lbWJlcnMtb25seS9tZW1iZXJzLW9ubHkuanMiLCJjb21tb24vZmFjdG9yaWVzL0Z1bGxzdGFja1BpY3MuanMiLCJjb21tb24vZmFjdG9yaWVzL1JhbmRvbUdyZWV0aW5ncy5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2JvYXJkL2J1aWxkLWJvYXJkLWRpcmVjdGl2ZS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2JvYXJkL3N0cmVhbWxpbmVkLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJjb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBOztBQUVBLHFCQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7QUFHQSxHQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7OztBQUdBLFFBQUEsNEJBQUEsR0FBQSxTQUFBLDRCQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBO0tBQ0EsQ0FBQTs7OztBQUlBLGNBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBOztBQUVBLFlBQUEsQ0FBQSw0QkFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBOzs7QUFHQSxtQkFBQTtTQUNBOztBQUVBLFlBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxFQUFBOzs7QUFHQSxtQkFBQTtTQUNBOzs7QUFHQSxhQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7Ozs7QUFJQSxnQkFBQSxJQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDbERBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7OztBQUdBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxpQkFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQTs7O0FBR0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDaEJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsT0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDTEEsQ0FBQSxZQUFBOztBQUVBLGdCQUFBLENBQUE7OztBQUdBLFFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBOztBQUVBLFFBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOzs7OztBQUtBLE9BQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0Esb0JBQUEsRUFBQSxvQkFBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7QUFDQSxxQkFBQSxFQUFBLHFCQUFBO0FBQ0Esc0JBQUEsRUFBQSxzQkFBQTtBQUNBLHdCQUFBLEVBQUEsd0JBQUE7QUFDQSxxQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxFQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsWUFBQSxVQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQSxDQUFBLGdCQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxhQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7QUFDQSx5QkFBQSxFQUFBLHVCQUFBLFFBQUEsRUFBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxhQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxXQUFBLEVBQ0EsVUFBQSxTQUFBLEVBQUE7QUFDQSxtQkFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtTQUNBLENBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQTs7QUFFQSxpQkFBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0E7Ozs7QUFJQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTs7Ozs7Ozs7OztBQVVBLGdCQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsSUFBQSxVQUFBLEtBQUEsSUFBQSxFQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7YUFDQTs7Ozs7QUFLQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsV0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsV0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7S0FFQSxDQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFlBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLEVBQUEsQ0FBQTs7QUNwSUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxjQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDRCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0JBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGVBQUE7QUFDQSxnQkFBQSxFQUFBLG1FQUFBO0FBQ0Esa0JBQUEsRUFBQSxvQkFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsdUJBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7O0FBR0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLEdBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLFFBQUE7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDL0JBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLENBQ0EsdURBQUEsRUFDQSxxSEFBQSxFQUNBLGlEQUFBLEVBQ0EsaURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxDQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDN0JBLEdBQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBOztBQUVBLFFBQUEsa0JBQUEsR0FBQSxTQUFBLGtCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFFBQUEsU0FBQSxHQUFBLENBQ0EsZUFBQSxFQUNBLHVCQUFBLEVBQ0Esc0JBQUEsRUFDQSx1QkFBQSxFQUNBLHlEQUFBLEVBQ0EsMENBQUEsRUFDQSxjQUFBLEVBQ0EsdUJBQUEsRUFDQSxJQUFBLEVBQ0EsaUNBQUEsRUFDQSwwREFBQSxFQUNBLDZFQUFBLENBQ0EsQ0FBQTs7QUFFQSxXQUFBO0FBQ0EsaUJBQUEsRUFBQSxTQUFBO0FBQ0EseUJBQUEsRUFBQSw2QkFBQTtBQUNBLG1CQUFBLGtCQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDNUJBLEdBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQSxFQUFBLFlBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsOENBQUE7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUEsT0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNYQSxNQUFBLENBQUEsS0FBQSxHQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7Q0FDQSxDQUFBOztBQUVBLElBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7OztBQUdBLElBQUEsYUFBQSxHQUFBLEdBQUEsQ0FBQTs7O0FBR0EsSUFBQSxRQUFBLEdBQUEsQ0FBQSxDQUFBOztBQUVBLElBQUEsT0FBQSxHQUFBLGFBQUEsR0FBQSxRQUFBLENBQUE7O0FBRUEsSUFBQSxPQUFBLEdBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsaUJBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSxpQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLGdCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsZUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsK0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsNEJBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSw4QkFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLCtCQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsOEJBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSxzQkFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLEVBQUEsT0FBQSxFQUFBLHNCQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsNEJBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSxtQ0FBQSxFQUFBO0NBQ0EsQ0FBQTs7QUFFQSxJQUFBLEtBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxlQUFBOzs7QUFHQSxnQkFBQSxFQUFBLDBCQUFBO0FBQ0EsaUJBQUEsRUFBQSwwQkFBQTtBQUNBLG1CQUFBLEVBQUEsMEJBQUE7OztBQUdBLGdCQUFBLEVBQUEsMEJBQUE7QUFDQSxpQkFBQSxFQUFBLDBCQUFBO0FBQ0EsbUJBQUEsRUFBQSwwQkFBQTs7QUFFQSxPQUFBLEVBQUE7O0FBRUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQ0E7QUFDQSxjQUFBLEVBQUEsb0JBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxZQUFBLENBQUE7QUFDQSxZQUFBLE9BQUEsQ0FBQTs7QUFFQSxZQUFBLFNBQUEsS0FBQSxPQUFBLElBQUEsU0FBQSxLQUFBLE1BQUEsRUFBQSxZQUFBLEdBQUEsSUFBQSxDQUFBLEtBQ0EsWUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxZQUFBLFNBQUEsS0FBQSxDQUFBLEVBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQSxDQUFBLENBQUEsS0FDQSxJQUFBLFNBQUEsS0FBQSxDQUFBLEVBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQSxDQUFBLENBQUEsS0FDQSxJQUFBLFNBQUEsS0FBQSxDQUFBLEVBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxhQUFBLEdBQUEsWUFBQSxDQUFBLENBQUEsS0FDQSxPQUFBLEdBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLGVBQUEsT0FBQSxDQUFBO0tBQ0E7Q0FDQSxDQUFBOztBQUVBLElBQUEsTUFBQSxHQUFBO0FBQ0EsT0FBQSxFQUFBOztBQUVBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLEVBQ0EsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLENBQUEsRUFDQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxFQUNBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLENBQ0E7Q0FDQSxDQUFBOztBQUVBLElBQUEsS0FBQSxHQUFBO0FBQ0EsUUFBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxDQUNBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUNBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBO0FBQ0EsY0FBQSxFQUFBLG9CQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxPQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLGVBQUEsT0FBQSxDQUFBO0tBQ0E7Q0FDQSxDQUFBOztBQUVBLFNBQUEsUUFBQSxHQUFBO0FBQ0EsY0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLE9BQUEsRUFBQSxjQUFBLENBQUEsQ0FBQTtDQUNBOztBQUVBLFNBQUEsVUFBQSxHQUFBO0FBQ0EsU0FBQSxJQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQTs7QUFFQSxnQkFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLENBQUEsQ0FBQTs7QUFFQSxnQkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBOztBQUVBLGdCQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxRQUFBLENBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0E7Q0FDQTs7QUFFQSxTQUFBLFVBQUEsR0FBQTtBQUNBLFNBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQSxDQUFBOztBQUVBLFlBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxNQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxLQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBLE1BQ0EsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLE9BQUEsRUFBQTtBQUNBLGdCQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7U0FDQSxNQUNBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxNQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLENBQUE7U0FDQTs7QUFFQSxhQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0tBQ0E7Q0FDQTs7QUFFQSxTQUFBLFVBQUEsR0FBQTtBQUNBLFFBQUEsTUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsZ0JBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EscUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHFCQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxtQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsbUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTthQUNBLE1BQ0EsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLHFCQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxxQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsbUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7YUFDQSxNQUNBLElBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EscUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLHFCQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxtQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsbUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTthQUNBLE1BQ0E7QUFDQSxxQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EscUJBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxtQkFBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO2FBQ0E7O0FBRUEsZ0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsRUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxFQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0E7Q0FDQTs7QUFFQSxTQUFBLElBQUEsR0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7Q0FDQTs7OztBQU9BLElBQUEsU0FBQSxHQUFBOztBQUVBLFdBQUEsRUFBQSx5QkFBQTtBQUNBLFVBQUEsRUFBQSx5QkFBQTtBQUNBLFlBQUEsRUFBQSx5QkFBQTtBQUNBLGVBQUEsRUFBQSxxQkFBQSxTQUFBLEVBQUE7QUFDQSxlQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtLQUNBO0NBQ0EsQ0FBQTs7QUFFQSxJQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxDQUFBOztBQUVBLElBQUEsT0FBQSxHQUFBLENBQ0EsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsRUFDQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxFQUNBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLENBQ0EsQ0FBQTs7O0FBR0EsSUFBQSxjQUFBLEdBQUEsQ0FDQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsU0FBQSxxQkFBQSxDQUFBLE9BQUEsRUFBQSxpQkFBQSxFQUFBO0FBQ0EsUUFBQSxhQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFNBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxpQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsS0FBQSxpQkFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLDZCQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBO0FBQ0EsV0FBQSxhQUFBLENBQUE7Q0FDQTs7QUFFQSxTQUFBLFdBQUEsQ0FBQSxPQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsUUFBQSxpQkFBQSxHQUFBLHFCQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLGFBQUEsR0FBQSxxQkFBQSxDQUFBLE9BQUEsRUFBQSxpQkFBQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLHVDQUFBLEVBQUEsYUFBQSxDQUFBLENBQUE7QUFDQSxpQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7O0FBR0EsaUJBQUEsV0FBQSxHQUFBOztBQUVBLGdCQUFBLFFBQUEsR0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLEtBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGlCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGlCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGlCQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxRQUFBLENBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxFQUFBLENBQUE7O0FBRUEscUJBQUEsVUFBQSxHQUFBO0FBQ0Esb0JBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLElBQUEsT0FBQSxHQUFBLGlCQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EseUNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLHlCQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSw0QkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtpQkFDQTthQUNBO1NBQ0E7S0FFQSxDQUFBLENBQUE7O0NBRUE7Ozs7Ozs7QUFRQSxTQUFBLHFCQUFBLENBQUEsa0JBQUEsRUFBQTtBQUNBLFdBQUEsa0JBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLENBQUEsV0FBQSxHQUFBLENBQUEsQ0FBQSxXQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQTs7QUFFQSxRQUFBLEVBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2U0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLHlEQUFBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ0xBLEdBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsRUFBQTtBQUNBLG1CQUFBLEVBQUEseUNBQUE7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUE7O0FBRUEsaUJBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FDQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsZUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxjQUFBLEVBQUEsS0FBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQ0EsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLHVCQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLDJCQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSwwQkFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLE9BQUEsR0FBQSxTQUFBLE9BQUEsR0FBQTtBQUNBLDJCQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EseUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsZ0JBQUEsVUFBQSxHQUFBLFNBQUEsVUFBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxtQkFBQSxFQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1NBRUE7O0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdGdWxsc3RhY2tHZW5lcmF0ZWRBcHAnLCBbJ2ZzYVByZUJ1aWx0JywgJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdBbmltYXRlJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEZ1bGxzdGFja1BpY3MpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gXy5zaHVmZmxlKEZ1bGxzdGFja1BpY3MpO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb2NzJywge1xuICAgICAgICB1cmw6ICcvZG9jcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG9jcy9kb2NzLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS9ob21lLmh0bWwnXG4gICAgfSk7XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbWVtYmVyc09ubHknLCB7XG4gICAgICAgIHVybDogJy9tZW1iZXJzLWFyZWEnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxpbWcgbmctcmVwZWF0PVwiaXRlbSBpbiBzdGFzaFwiIHdpZHRoPVwiMzAwXCIgbmctc3JjPVwie3sgaXRlbSB9fVwiIC8+JyxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgU2VjcmV0U3Rhc2gpIHtcbiAgICAgICAgICAgIFNlY3JldFN0YXNoLmdldFN0YXNoKCkudGhlbihmdW5jdGlvbiAoc3Rhc2gpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3Rhc2ggPSBzdGFzaDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRhdGEuYXV0aGVudGljYXRlIGlzIHJlYWQgYnkgYW4gZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgLy8gdGhhdCBjb250cm9scyBhY2Nlc3MgdG8gdGhpcyBzdGF0ZS4gUmVmZXIgdG8gYXBwLmpzLlxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmZhY3RvcnkoJ1NlY3JldFN0YXNoJywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICB2YXIgZ2V0U3Rhc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9zZWNyZXQtc3Rhc2gnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRTdGFzaDogZ2V0U3Rhc2hcbiAgICB9O1xuXG59KTsiLCJhcHAuZmFjdG9yeSgnRnVsbHN0YWNrUGljcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0UtVDc1bFdBQUFtcXFKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0V2WkFnLVZBQUFrOTMyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VnTk1lT1hJQUlmRGhLLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VReUlETldnQUF1NjBCLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0NGM1Q1UVc4QUUybEdKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FlVnc1U1dvQUFBTHNqLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FhSklQN1VrQUFsSUdzLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FRT3c5bFdFQUFZOUZsLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1PUWJWckNNQUFOd0lNLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjliX2Vyd0NZQUF3UmNKLnBuZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjVQVGR2bkNjQUVBbDR4LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjRxd0MwaUNZQUFsUEdoLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjJiMzN2UklVQUE5bzFELmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQndwSXdyMUlVQUF2TzJfLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQnNTc2VBTkNZQUVPaEx3LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0o0dkxmdVV3QUFkYTRMLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0k3d3pqRVZFQUFPUHBTLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lkSHZUMlVzQUFubkhWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0dDaVBfWVdZQUFvNzVWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lTNEpQSVdJQUkzN3F1LmpwZzpsYXJnZSdcbiAgICBdO1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnUmFuZG9tR3JlZXRpbmdzJywgZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGdldFJhbmRvbUZyb21BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgcmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV07XG4gICAgfTtcblxuICAgIHZhciBncmVldGluZ3MgPSBbXG4gICAgICAgICdIZWxsbywgd29ybGQhJyxcbiAgICAgICAgJ0F0IGxvbmcgbGFzdCwgSSBsaXZlIScsXG4gICAgICAgICdIZWxsbywgc2ltcGxlIGh1bWFuLicsXG4gICAgICAgICdXaGF0IGEgYmVhdXRpZnVsIGRheSEnLFxuICAgICAgICAnSVxcJ20gbGlrZSBhbnkgb3RoZXIgcHJvamVjdCwgZXhjZXB0IHRoYXQgSSBhbSB5b3Vycy4gOiknLFxuICAgICAgICAnVGhpcyBlbXB0eSBzdHJpbmcgaXMgZm9yIExpbmRzYXkgTGV2aW5lLicsXG4gICAgICAgICfjgZPjgpPjgavjgaHjga/jgIHjg6bjg7zjgrbjg7zmp5jjgIInLFxuICAgICAgICAnV2VsY29tZS4gVG8uIFdFQlNJVEUuJyxcbiAgICAgICAgJzpEJyxcbiAgICAgICAgJ1llcywgSSB0aGluayB3ZVxcJ3ZlIG1ldCBiZWZvcmUuJyxcbiAgICAgICAgJ0dpbW1lIDMgbWlucy4uLiBJIGp1c3QgZ3JhYmJlZCB0aGlzIHJlYWxseSBkb3BlIGZyaXR0YXRhJyxcbiAgICAgICAgJ0lmIENvb3BlciBjb3VsZCBvZmZlciBvbmx5IG9uZSBwaWVjZSBvZiBhZHZpY2UsIGl0IHdvdWxkIGJlIHRvIG5ldlNRVUlSUkVMIScsXG4gICAgXTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdyZWV0aW5nczogZ3JlZXRpbmdzLFxuICAgICAgICBnZXRSYW5kb21HcmVldGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFJhbmRvbUZyb21BcnJheShncmVldGluZ3MpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdidWlsZEJvYXJkJywgZnVuY3Rpb24gKCkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvY29tbW9uL2RpcmVjdGl2ZXMvYm9hcmQvYnVpbGQtYm9hcmQuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICAgIFx0Ly90aGlzIGZ1bmN0aW9uIGNvbWVzIGZyb20gc3RyZWFtbGluZWQuanNcbiAgICAgICAgXHR3aW5kb3cuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyIsIndpbmRvdy5zdGFydCA9IGZ1bmN0aW9uKCl7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmRcIikuYXBwZW5kQ2hpbGQocmVuZGVyZXIudmlldyk7XG59XG5cbnZhciBzdGFnZSA9IG5ldyBQSVhJLlN0YWdlKDB4NjZmZjk5KTtcbnZhciByZW5kZXJlciA9IG5ldyBQSVhJLkNhbnZhc1JlbmRlcmVyKDQ1MCw0NTApO1xuXG4vL2FsbCBpbWFnZSBmaWxlcyBhcmUgMTUwcHguIERvIG5vdCBjaGFuZ2UgdGhpcyBudW1iZXIhXG52YXIgaW1nU2l6ZUFjdHVhbCA9IDE1MCBcblxuLy9mYWN0b3IgdG8gcmVzY2FsZSBpbWFnZXMgYnkuIFRoaXMgbnVtYmVyIGNhbiBiZSBjaGFuZ2VkXG52YXIgaW1nU2NhbGUgPSA0IFxuXG52YXIgaW1nU2l6ZSA9IGltZ1NpemVBY3R1YWwvaW1nU2NhbGVcblxudmFyIHRpbGVJbWcgPSB7XG5cIjBcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcmVwYWlyLmpwZ1wifSxcblwiMVwiOiB7XCJpbWFnZVwiOlwiL2ltZy9vcHRpb24uanBnXCJ9LFxuXCIyXCI6IHtcImltYWdlXCI6XCIvaW1nL2VtcHR5LmpwZ1wifSxcblwiM1wiOiB7XCJpbWFnZVwiOlwiL2ltZy92b2lkLmpwZ1wifSxcblwiNFwiOiB7XCJpbWFnZVwiOlwiL2ltZy9yb2xsZXItZXhwcmVzcy13bi5qcGdcIn0sXG5cIjVcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcm9sbGVyLWV4cHJlc3Mtc291dGguanBnXCJ9LFxuXCI2XCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1leHByZXNzLWVzLmpwZ1wifSxcblwiN1wiOiB7XCJpbWFnZVwiOlwiL2ltZy9yb2xsZXItZXhwcmVzcy1zdy5qcGdcIn0sXG5cIjhcIjoge1wiaW1hZ2VcIjpcIi9pbWcvcm9sbGVyLWV4cHJlc3Mtc2UuanBnXCJ9LFxuXCI5XCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1leHByZXNzLXdlc3QuanBnXCJ9LFxuXCIxMFwiOiB7XCJpbWFnZVwiOlwiL2ltZy9yb2xsZXItZXhwcmVzcy1ub3J0aC5qcGdcIn0sXG5cIjExXCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci1leHByZXNzLWVhc3QuanBnXCJ9LFxuXCIxMlwiOiB7XCJpbWFnZVwiOlwiL2ltZy9yb2xsZXItZWFzdC5wbmdcIn0sXG5cIjEzXCI6IHtcImltYWdlXCI6XCIvaW1nL3JvbGxlci13ZXN0LnBuZ1wifSxcblwiMThcIjoge1wiaW1hZ2VcIjpcIi9pbWcvc3Bpbm5lci1jbG9ja3dpc2UuanBnXCJ9LFxuXCIxOVwiOiB7XCJpbWFnZVwiOlwiL2ltZy9zcGlubmVyLWNvdW50ZXJjbG9ja3dpc2UuanBnXCJ9XG59O1xuXG52YXIgd2FsbHMgPSB7XG4gIFwibm9MYXNlclwiOiBcIi9pbWcvd2FsbC5wbmdcIixcblxuICAvL2ltYWdlcyByZWxhdGVkIHRvIGxhc2VycyB0aGF0IGFyZSBvbiB0aGUgbm9ydGggb3IgZWFzdCB3YWxsc1xuICBcIm9uZUxhc2VyTkVcIjogXCIvaW1nL2xhc2VyLXNpbmdsZS1ORS5wbmdcIixcbiAgXCJ0d29MYXNlcnNORVwiOiBcIi9pbWcvbGFzZXItZG91YmxlLU5FLnBuZ1wiLFxuICBcInRocmVlTGFzZXJzTkVcIjogXCIvaW1nL2xhc2VyLXRyaXBsZS1ORS5wbmdcIixcblxuICAvL2ltYWdlcyByZWxhdGVkIHRvIGxhc2VycyB0aGF0IGFyZSBvbiB0aGUgc291dGggb3Igd2VzdCB3YWxscyxcbiAgXCJvbmVMYXNlclNXXCI6IFwiL2ltZy9sYXNlci1zaW5nbGUtU1cucG5nXCIsXG4gIFwidHdvTGFzZXJzU1dcIjogXCIvaW1nL2xhc2VyLWRvdWJsZS1TVy5wbmdcIixcbiAgXCJ0aHJlZUxhc2Vyc1NXXCI6IFwiL2ltZy9sYXNlci10cmlwbGUtU1cucG5nXCIsXG5cbiAgbWFwOiBbXG4gIC8vcm93LCBjb2wsIGRpcmVjdGlvbiwgbnVtYmVyIG9mIGxhc2Vyc1xuICAgIFswLDIsXCJub3J0aFwiLCAwXSwgWzAsNCxcIm5vcnRoXCIsIDBdLCBbMCw3LFwibm9ydGhcIiwgMF0sIFswLDksXCJub3J0aFwiLCAwXSxcbiAgICBbMiwwLFwid2VzdFwiLCAwXSwgWzIsMyxcInNvdXRoXCIsIDBdLCBbMiwxMSxcImVhc3RcIiwgMF0sXG4gICAgWzMsNSxcIndlc3RcIiwgMF0sIFszLDYsXCJlYXN0XCIsIDFdLFxuICAgIFs0LDAsXCJ3ZXN0XCIsIDBdLCBbNCwxMSxcImVhc3RcIiwgMF0sXG4gICAgWzUsOCxcIm5vcnRoXCIsIDFdLFxuICAgIFs2LDMsXCJzb3V0aFwiLCAxXSwgXG4gICAgWzcsMCxcIndlc3RcIiwgMF0sIFs3LDExLFwiZWFzdFwiLCAwXSxcbiAgICBbOCw1LFwid2VzdFwiLCAxXSwgWzgsNixcImVhc3RcIiwgMF0sXG4gICAgWzksMCxcIndlc3RcIiwgMF0sIFs5LDgsXCJub3J0aFwiLCAwXSwgWzksMTEsXCJlYXN0XCIsIDBdLFxuICAgIFsxMSwyLFwic291dGhcIiwgMF0sIFsxMSw0LFwic291dGhcIiwgMF0sIFsxMSw3LFwic291dGhcIiwgMF0sIFsxMSw5LFwic291dGhcIiwgMF1cbiAgXSxcbiAgZ2V0V2FsbEltZzogZnVuY3Rpb24oY29vcmRpbmF0ZSkge1xuICAgIHZhciBkaXJlY3Rpb24gPSBjb29yZGluYXRlWzJdO1xuICAgIHZhciBudW1MYXNlcnMgPSBjb29yZGluYXRlWzNdO1xuICAgIHZhciBsYXNlckltZ0ZpbGU7XG4gICAgdmFyIHdhbGxTcmM7XG5cbiAgICBpZihkaXJlY3Rpb24gPT09IFwibm9ydGhcIiB8fCBkaXJlY3Rpb24gPT09IFwiZWFzdFwiKSBsYXNlckltZ0ZpbGUgPSBcIk5FXCI7XG4gICAgZWxzZSBsYXNlckltZ0ZpbGUgPSBcIlNXXCJcbiAgICBcbiAgICBpZiAobnVtTGFzZXJzID09PSAxKSB3YWxsU3JjID0gd2FsbHNbXCJvbmVMYXNlclwiICsgbGFzZXJJbWdGaWxlXTtcbiAgICBlbHNlIGlmIChudW1MYXNlcnMgPT09IDIpIHdhbGxTcmMgPSB3YWxsc1tcInR3b0xhc2Vyc1wiICsgbGFzZXJJbWdGaWxlXTtcbiAgICBlbHNlIGlmIChudW1MYXNlcnMgPT09IDMpIHdhbGxTcmMgPSB3YWxsc1tcInRocmVlTGFzZXJzXCIgKyBsYXNlckltZ0ZpbGVdO1xuICAgIGVsc2Ugd2FsbFNyYyA9IHdhbGxzLm5vTGFzZXJcbiAgICByZXR1cm4gd2FsbFNyYztcbiAgfVxufVxuXG52YXIgbGFzZXJzID0ge1xuICBtYXA6IFsgXG4gIC8vc3RhcnQsIGVuZCwgdmVydGljYWwgb3IgaG9yaXpvbnRhbFxuICBbWzYsM10sIFs1LDNdLCBcImhcIl0sXG4gIFtbOCw1XSwgWzgsOF0sIFwidlwiXSxcbiAgW1szLDZdLCBbMywyXSwgXCJ2XCJdLFxuICBbWzUsOF0sIFs2LDhdLCBcImhcIl1cbiAgXVxufVxuXG52YXIgdGlsZXMgPSB7XG4gIGNvbHM6IDEyLFxuICByb3dzOiAxMixcbiAgbWFwOiBbXG4gICAgMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsXG4gICAgMiw4LDExLDExLDYsMiwyLDgsMTEsMTEsNiwyLFxuICAgIDIsMTAsMTgsMiw1LDE5LDIsMTAsMTgsMiw1LDIsXG4gICAgMiwxMCwwLDE4LDUsMiwyLDEwLDEsMTgsNSwyLFxuICAgIDIsNCw5LDksNywyLDE5LDQsOSw5LDcsMixcbiAgICAyLDIsMiwyLDE5LDIsMiwyLDIsMTksMiwyLFxuICAgIDIsMiwxOSwyLDIsMiwyLDE5LDIsMiwyLDIsXG4gICAgMiw4LDExLDExLDYsMTksMiw4LDExLDExLDYsMixcbiAgICAyLDEwLDE4LDEsNSwyLDIsMTAsMTgsMCw1LDIsXG4gICAgMiwxMCwyLDE4LDUsMiwxOSwxMCwyLDE4LDUsMixcbiAgICAyLDQsOSw5LDcsMiwyLDQsOSw5LDcsMixcbiAgICAyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMlxuICBdLFxuICBnZXRUaWxlSW1nOiBmdW5jdGlvbihjb2wsIHJvdyl7XG4gICAgdmFyIHRpbGVJZCA9IHRoaXMubWFwW3JvdyAqIHRoaXMucm93cyArIGNvbF0udG9TdHJpbmcoKTtcbiAgICB2YXIgdGlsZVNyYyA9IHRpbGVJbWdbdGlsZUlkXS5pbWFnZTtcbiAgICByZXR1cm4gdGlsZVNyYztcbiAgfVxufTtcblxuZnVuY3Rpb24gYnVpbGRNYXAoKXtcbiAgYnVpbGRUaWxlcygpO1xuICBidWlsZFdhbGxzKCk7XG4gIGRyYXdMYXNlcnMoKTtcbiAgZHJhd1BsYXllcnMocGxheWVycywgcGxheWVyczFzdE1vdmUpO1xufVxuXG5mdW5jdGlvbiBidWlsZFRpbGVzKCkge1xuICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aWxlcy5jb2xzOyBjb2wgKyspe1xuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRpbGVzLnJvd3M7IHJvdyArKyl7XG4gICAgICB2YXIgdGlsZVNyYyA9IHRpbGVzLmdldFRpbGVJbWcoY29sLCByb3cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vMTUweDE1MCBpcyB0aGUgYWN0dWFsIGltYWdlIHNpemVcbiAgICAgIHZhciB0aWxlID0gbmV3IFBJWEkuZXh0cmFzLlRpbGluZ1Nwcml0ZS5mcm9tSW1hZ2UodGlsZVNyYywgaW1nU2l6ZUFjdHVhbCwgaW1nU2l6ZUFjdHVhbClcbiAgICAgIFxuICAgICAgdGlsZS5wb3NpdGlvbi54ID0gaW1nU2l6ZSpjb2xcbiAgICAgIHRpbGUucG9zaXRpb24ueSA9IGltZ1NpemUqcm93O1xuICAgICAgLy9yZXNjYWxlcyB0aGUgMTUwcHggdGlsZSBpbWFnZSB0byBiZSA0IHRpbWVzIHNtYWxsZXIgXG4gICAgICB0aWxlLnNjYWxlLnNldCgxL2ltZ1NjYWxlLCAxL2ltZ1NjYWxlKTtcblxuICAgICAgc3RhZ2UuYWRkQ2hpbGQodGlsZSlcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYnVpbGRXYWxscygpIHtcbiAgZm9yKHZhciBpID0gMDsgaSA8IHdhbGxzLm1hcC5sZW5ndGg7IGkrKykge1xuICAgIHZhciB3YWxsU3JjID0gd2FsbHMuZ2V0V2FsbEltZyh3YWxscy5tYXBbaV0pXG4gICAgdmFyIHdhbGwgPSBuZXcgUElYSS5TcHJpdGUoUElYSS5UZXh0dXJlLmZyb21JbWFnZSh3YWxsU3JjKSlcblxuICAgIHdhbGwucG9zaXRpb24ueCA9IGltZ1NpemUqd2FsbHMubWFwW2ldWzFdO1xuICAgIHdhbGwucG9zaXRpb24ueSA9IGltZ1NpemUqd2FsbHMubWFwW2ldWzBdO1xuICAgIHdhbGwuc2NhbGUuc2V0KDEvaW1nU2NhbGUsIDEvaW1nU2NhbGUpO1xuXG4gICAgaWYod2FsbHMubWFwW2ldWzJdID09PSBcIndlc3RcIikge1xuICAgICAgd2FsbC5yb3RhdGlvbiA9IE1hdGguUEkvMlxuICAgICAgaWYod2FsbHMubWFwW2ldWzNdID4gMCkgd2FsbC5wb3NpdGlvbi54ID0gd2FsbC5wb3NpdGlvbi54ICsgMzcuNVxuICAgICAgZWxzZSB3YWxsLnBvc2l0aW9uLnggPSB3YWxsLnBvc2l0aW9uLnggKyA1XG4gICAgfSBcbiAgICBlbHNlIGlmICh3YWxscy5tYXBbaV1bMl0gPT09IFwic291dGhcIikge1xuICAgICAgaWYod2FsbHMubWFwW2ldWzNdID09PSAwKSB3YWxsLnBvc2l0aW9uLnkgPSB3YWxsLnBvc2l0aW9uLnkgKyBpbWdTaXplIC0gNSAgICAgIFxuICAgIH0gXG4gICAgZWxzZSBpZiAod2FsbHMubWFwW2ldWzJdID09PSBcImVhc3RcIikge1xuICAgICAgd2FsbC5yb3RhdGlvbiA9IE1hdGguUEkvMlxuICAgICAgd2FsbC5wb3NpdGlvbi54ID0gd2FsbC5wb3NpdGlvbi54ICsgMzcuNSAgICAgIFxuICAgIH1cblxuICAgIHN0YWdlLmFkZENoaWxkKHdhbGwpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRyYXdMYXNlcnMoKSB7XG4gIGlmKGxhc2Vycykge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBsYXNlcnMubWFwLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGluZSA9IG5ldyBQSVhJLkdyYXBoaWNzO1xuICAgICAgdmFyIHhGcm9tLCB5RnJvbSwgeFRvLCB5VG87XG4gICAgICBpZihsYXNlcnMubWFwW2ldWzJdID09PSBcImhcIiAmJiBsYXNlcnMubWFwW2ldWzBdWzBdID4gbGFzZXJzLm1hcFtpXVsxXVswXSkge1xuICAgICAgICB4RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMF0gKyAwLjdcbiAgICAgICAgeUZyb20gPSBsYXNlcnMubWFwW2ldWzBdWzFdICsgMC41XG4gICAgICAgIHhUbyA9IGxhc2Vycy5tYXBbaV1bMV1bMF0gKyAwLjFcbiAgICAgICAgeVRvID0gbGFzZXJzLm1hcFtpXVsxXVsxXSArIDAuNVxuICAgICAgfVxuICAgICAgZWxzZSBpZihsYXNlcnMubWFwW2ldWzJdID09PSBcImhcIikge1xuICAgICAgICB4RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMF0gKyAwLjNcbiAgICAgICAgeUZyb20gPSBsYXNlcnMubWFwW2ldWzBdWzFdICsgMC41XG4gICAgICAgIHhUbyA9IGxhc2Vycy5tYXBbaV1bMV1bMF0gKyAwLjlcbiAgICAgICAgeVRvID0gbGFzZXJzLm1hcFtpXVsxXVsxXSArIDAuNVxuICAgICAgfVxuICAgICAgZWxzZSBpZihsYXNlcnMubWFwW2ldWzJdID09PSBcInZcIiAmJiBsYXNlcnMubWFwW2ldWzBdWzFdID4gbGFzZXJzLm1hcFtpXVsxXVsxXSkge1xuICAgICAgICB4RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMF0gKyAwLjVcbiAgICAgICAgeUZyb20gPSBsYXNlcnMubWFwW2ldWzBdWzFdICsgMC43XG4gICAgICAgIHhUbyA9IGxhc2Vycy5tYXBbaV1bMV1bMF0gKyAwLjVcbiAgICAgICAgeVRvID0gbGFzZXJzLm1hcFtpXVsxXVsxXSArIDFcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB4RnJvbSA9IGxhc2Vycy5tYXBbaV1bMF1bMF0gKyAwLjVcbiAgICAgICAgeUZyb20gPSBsYXNlcnMubWFwW2ldWzBdWzFdICsgMC4xXG4gICAgICAgIHhUbyA9IGxhc2Vycy5tYXBbaV1bMV1bMF0gKyAwLjVcbiAgICAgICAgeVRvID0gbGFzZXJzLm1hcFtpXVsxXVsxXSArIDFcbiAgICAgIH1cblxuICAgICAgbGluZS5saW5lU3R5bGUoMSwgMHhmZjAwMDApXG4gICAgICBsaW5lLm1vdmVUbyh4RnJvbSozNy41LCB5RnJvbSozNy41KVxuICAgICAgbGluZS5saW5lVG8oeFRvKjM3LjUsIHlUbyozNy41KVxuXG4gICAgICBzdGFnZS5hZGRDaGlsZChsaW5lKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0KCl7XG4gIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XG59XG5cblxuXG5cbi8vIHZhciBnYW1lU3RhdGUgPSBwbGF5O1xuXG52YXIgcm9ib3RJbWdzID0ge1xuICAvL3JvYm90IG5hbWU6IHJvYm90IGltYWdlIHBhdGhcbiAgXCJncmVlblwiOiBcIi9pbWcvcm9ib3RzL3JvYm90XzAucG5nXCIsXG4gIFwiYmx1ZVwiOiBcIi9pbWcvcm9ib3RzL3JvYm90XzEucG5nXCIsXG4gIFwieWVsbG93XCI6IFwiL2ltZy9yb2JvdHMvcm9ib3RfMi5wbmdcIixcbiAgZ2V0Um9ib3RJbWc6IGZ1bmN0aW9uKHJvYm90TmFtZSkge1xuICAgIHJldHVybiByb2JvdEltZ3Nbcm9ib3ROYW1lXVxuICB9XG59XG5cbnZhciBwbGF5ZXIxLCBwbGF5ZXIyLCBwbGF5ZXIzO1xuLy9zZWVkIGZvciBvcmlnaW5hbCBsb2NhdGlvblxudmFyIHBsYXllcnMgPSBbXG4gIHsgcGxheWVyOiBcInBsYXllcjFcIiwgbG9jYXRpb246IFswLDExXSwgYmVhcmluZzogWy0xLCAwXSwgcm9ib3Q6IFwiZ3JlZW5cIiwgcHJpb3JpdHlWYWw6IG51bGwgfSxcbiAgeyBwbGF5ZXI6IFwicGxheWVyMlwiLCBsb2NhdGlvbjogWzIsMTFdLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJibHVlXCIsIHByaW9yaXR5VmFsOiBudWxsIH0sXG4gIHsgcGxheWVyOiBcInBsYXllcjNcIiwgbG9jYXRpb246IFs0LDExXSwgYmVhcmluZzogWy0xLCAwXSwgcm9ib3Q6IFwieWVsbG93XCIsIHByaW9yaXR5VmFsOiBudWxsIH0sXG5dXG5cbi8vc2VlZCBmb3Igc2Vjb25kIGxvY2F0aW9uXG52YXIgcGxheWVyczFzdE1vdmUgPSBbXG4gIHsgcGxheWVyOiBcInBsYXllcjFcIiwgbG9jYXRpb246IFswLDldLCBiZWFyaW5nOiBbLTEsIDBdLCByb2JvdDogXCJncmVlblwiLCBwcmlvcml0eVZhbDogNTAwIH0sXG4gIHsgcGxheWVyOiBcInBsYXllcjJcIiwgbG9jYXRpb246IFsyLDddLCBiZWFyaW5nOiBbMSwgMF0sIHJvYm90OiBcImJsdWVcIiwgcHJpb3JpdHlWYWw6IDIwMCB9LFxuICB7IHBsYXllcjogXCJwbGF5ZXIzXCIsIGxvY2F0aW9uOiBbNCw4XSwgYmVhcmluZzogWzAsIDFdLCByb2JvdDogXCJ5ZWxsb3dcIiwgcHJpb3JpdHlWYWw6IDgwMCB9LFxuXVxuXG5mdW5jdGlvbiBzb3J0SW50aWFsRGVzdGluYXRpb24oaW5pdGlhbCwgc29ydGVkRGVzdGluYXRpb24pIHtcbiAgdmFyIHNvcnRlZEluaXRpYWwgPSBbXTtcblxuICBmb3IodmFyIGkgPSAwOyBpIDwgc29ydGVkRGVzdGluYXRpb24ubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IodmFyIGogPSAwOyBqIDwgaW5pdGlhbC5sZW5ndGg7IGorKykge1xuICAgICAgaWYoaW5pdGlhbFtqXS5yb2JvdCA9PT0gc29ydGVkRGVzdGluYXRpb25baV0ucm9ib3QpIHtcbiAgICAgICAgc29ydGVkSW5pdGlhbC5wdXNoKGluaXRpYWxbal0pXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBzb3J0ZWRJbml0aWFsO1xufVxuXG5mdW5jdGlvbiBkcmF3UGxheWVycyhpbml0aWFsLCBkZXN0aW5hdGlvbikge1xuICB2YXIgc29ydGVkRGVzdGluYXRpb24gPSBzb3J0UGxheWVyc0J5UHJpb3JpdHkoZGVzdGluYXRpb24pO1xuICBjb25zb2xlLmxvZyhzb3J0ZWREZXN0aW5hdGlvbilcblxuICB2YXIgc29ydGVkSW5pdGlhbCA9IHNvcnRJbnRpYWxEZXN0aW5hdGlvbihpbml0aWFsLCBzb3J0ZWREZXN0aW5hdGlvbik7XG4gIGNvbnNvbGUubG9nKCdzb3J0ZWQgaW5pdGlhbCBpbiB0aGUgZHJhd3BsYXllcnMgZm5jJywgc29ydGVkSW5pdGlhbClcbiAgc29ydGVkSW5pdGlhbC5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllciwgaWR4KXtcblxuICAgIHNldFRpbWVvdXQoZG9Tb21ldGhpbmcuYmluZChudWxsLCBwbGF5ZXIpLCBpZHgqMjAwMCk7XG5cblxuICAgICAgZnVuY3Rpb24gZG9Tb21ldGhpbmcoKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgcm9ib3RJbWcgPSByb2JvdEltZ3MuZ2V0Um9ib3RJbWcocGxheWVyLnJvYm90KTtcbiAgICAgICAgdmFyIHJvYm90ID0gbmV3IFBJWEkuU3ByaXRlKFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2Uocm9ib3RJbWcpKTtcbiAgICAgICAgcm9ib3QucG9zaXRpb24ueCA9IGltZ1NpemUqcGxheWVyLmxvY2F0aW9uWzBdO1xuICAgICAgICByb2JvdC5wb3NpdGlvbi55ID0gaW1nU2l6ZSpwbGF5ZXIubG9jYXRpb25bMV07XG4gICAgICAgIHJvYm90LnNjYWxlLnNldCgxL2ltZ1NjYWxlLCAxL2ltZ1NjYWxlKTtcblxuICAgICAgICBzdGFnZS5hZGRDaGlsZChyb2JvdCk7XG5cbiAgICAgICAgbW92ZVBsYXllcigpXG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZVBsYXllcigpIHtcbiAgICAgICAgICBpZihyb2JvdC5wb3NpdGlvbi55ID49IGltZ1NpemUqc29ydGVkRGVzdGluYXRpb25baWR4XS5sb2NhdGlvblsxXSkge1xuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmVQbGF5ZXIpO1xuICAgICAgICAgICAgcm9ib3QucG9zaXRpb24ueSAtPSAxO1xuICAgICAgICAgICAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcbiAgICAgICAgICB9IFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgfSlcbiAgICAvLyBtb3ZlUGxheWVyKCk7XG59XG4vLyBmdW5jdGlvbiBkcmF3UGxheWVycyhpbnRpYWwsIGRlc3RpbmF0aW9uKSB7XG4vLyAgIHBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpe1xuICAgIFxuLy8gICB9KVxuLy8gfVxuXG5cbmZ1bmN0aW9uIHNvcnRQbGF5ZXJzQnlQcmlvcml0eSAoYXJyT2ZQbGF5ZXJPYmplY3RzKSB7XG4gIHJldHVybiBhcnJPZlBsYXllck9iamVjdHMuc29ydChmdW5jdGlvbihhLGIpIHtcbiAgICByZXR1cm4gYi5wcmlvcml0eVZhbCAtIGEucHJpb3JpdHlWYWxcbiAgfSlcbn1cblxuYnVpbGRNYXAoKTtcblxuXG5cbi8vIGZ1bmN0aW9uIGRyYXdQbGF5ZXJzKGluaXRpYWwsIGRlc3RpbmF0aW9uKSB7XG4vLyAgIGluaXRpYWwuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIsIGlkeCl7XG4vLyAgICAgdmFyIHJvYm90SW1nID0gcm9ib3RJbWdzLmdldFJvYm90SW1nKHBsYXllci5yb2JvdCk7XG4vLyAgICAgdmFyIHJvYm90ID0gbmV3IFBJWEkuU3ByaXRlKFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2Uocm9ib3RJbWcpKTtcbi8vICAgICByb2JvdC5wb3NpdGlvbi54ID0gaW1nU2l6ZSpwbGF5ZXIubG9jYXRpb25bMF07XG4vLyAgICAgcm9ib3QucG9zaXRpb24ueSA9IGltZ1NpemUqcGxheWVyLmxvY2F0aW9uWzFdO1xuLy8gICAgIHJvYm90LnNjYWxlLnNldCgxL2ltZ1NjYWxlLCAxL2ltZ1NjYWxlKTtcblxuLy8gICAgIHN0YWdlLmFkZENoaWxkKHJvYm90KTtcblxuLy8gICAgIG1vdmVQbGF5ZXIoKVxuXG4vLyAgICAgZnVuY3Rpb24gbW92ZVBsYXllcigpIHtcbi8vICAgICAgIGlmKHJvYm90LnBvc2l0aW9uLnkgPj0gaW1nU2l6ZSpkZXN0aW5hdGlvbltpZHhdLmxvY2F0aW9uWzFdKSB7XG4vLyAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlUGxheWVyKTtcbi8vICAgICAgICAgcm9ib3QucG9zaXRpb24ueSAtPSAxO1xuLy8gICAgICAgICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vICAgfSlcblxuLy8gICAgIC8vIG1vdmVQbGF5ZXIoKTtcbi8vIH1cbiIsImFwcC5kaXJlY3RpdmUoJ2Z1bGxzdGFja0xvZ28nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5odG1sJ1xuICAgIH07XG59KTsiLCJhcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIEFVVEhfRVZFTlRTLCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0hvbWUnLCBzdGF0ZTogJ2hvbWUnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0Fib3V0Jywgc3RhdGU6ICdhYm91dCcgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnRG9jdW1lbnRhdGlvbicsIHN0YXRlOiAnZG9jcycgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnTWVtYmVycyBPbmx5Jywgc3RhdGU6ICdtZW1iZXJzT25seScsIGF1dGg6IHRydWUgfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
