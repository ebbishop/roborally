var Firebase = require("firebase");
var currentGame = {};
var baseUrl = "https://gha-roborally.firebaseio.com/";

/*
-post save hook to send current game state to Firebase
-attach Firebase key to game object
*/

module.exports = {
    base: function() {
        return new Firebase(baseUrl);
    },
    setConnection: function(key) {
        currentGame[key] = new Firebase(baseUrl + key);
        return currentGame[key]
    },
    getConnection: function(key) {
        if (!currentGame[key]) {
            return this.setConnection(key)
        }
        else return currentGame[key]
    }
};
