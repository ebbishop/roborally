var Firebase = require("firebase");
var currentGame;
var baseUrl = "https://resplendent-torch-4322.firebaseio.com/";

/*
-post save hook to send current game state to Firebase
-attach Firebase key to game object
*/

module.exports = {
    base: function() {
        return new Firebase(baseUrl);
    },
    setConnection: function(key) {
        var currentGame = new Firebase(baseUrl + key);
        return currentGame
    },
    getConnection: function() {
        return currentGame.key()
    }
};
