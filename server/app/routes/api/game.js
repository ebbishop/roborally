var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Promise = require('bluebird');
var firebaseHelper = require("../../../firebase/firebase.js");

var Game = mongoose.model('Game');
var Player = mongoose.model('Player');

//URL: /api/game

router.param('gameId', function(req, res, next, gameId) {
	Game.findById(gameId)
	.then(function(game) {
		req.game = game;
		next()
	})
	.then(null, next)
})

// router.post('/', function(req, res, next) {
// 		var newGame = firebaseHelper.getConnection('1234')
// 		newGame.child('game').child(1).set('game info1')
// 		newGame.child('game').child(2).set('game info2')
// 		res.send('done')
// })

//click 'create new game'
//req.body will include board selection
//front-end note: state.go to the newly created board
router.post('/', function(req, res, next) {
	Game.create(req.body)
	.then(function(newGame) {
		return newGame.initializeGame()
		.then(function(updatedGame) {
			var newGame = firebaseHelper.getConnection(updatedGame._id)
			newGame.child('game').set(updatedGame)
			// sending game info to frontend so we can use it's ID to retrieve data from firebase
			res.status(201).send(updatedGame)
			// var newGame = firebaseHelper.getConnection('1234')
			// newGame.child('game').set('game info')
		})
	})
	.then(null, next)
})

// AW: better promise chain
// router.post('/', function(req, res, next) {
// 	Game.create(req.body)
// 	.then(function(newGame) {
// 		return newGame.initializeGame()
// 	})
// 	.then(function(updatedGame) {
// 		var newGame = firebaseHelper.getConnection(updatedGame._id)
// 		newGame.child('game').set(updatedGame)
// 			// sending game info to frontend so we can use it's ID to retrieve data from firebase
// 		res.status(201).send(updatedGame)
// 			// var newGame = firebaseHelper.getConnection('1234')
// 			// newGame.child('game').set('game info')
// 	})
// 	.then(null, next)
// })


// player selects robot and THEN clicks 'join game'
// add player to game and assign game id to the player
router.post('/:gameId/player', function(req, res, next) {
	var gameId = req.params.gameId
	Player.create(req.body)
	.then(function(newPlayer) {
		newPlayer.set({'game': gameId})
		newPlayer.save()
		return newPlayer
		/*
			AW: think you want to do: 
			return newPlayer.save()

		*/
	})
	.then(function(newPlayer) {
		//sending player info to frontend so we can use it's ID to retrieve data from firebase
		res.status(201).send(newPlayer)
	})
	.then(null, next)
})

//get game
router.get('/:gameId', function(req, res) {
	res.json(req.game)
})

//deal cards to all players in game when game is active and state is in 'decision' mode
router.get('/:gameId/cards', function(req, res, next) {
	var gameId = req.params.gameId;
	if (req.game.active === true && req.game.state === 'decision') {
		Player.find({game: gameId})
		.then(function(players) {
			//assuming dealCards is a method on the Player model
			//assuming dealCards updates hand of each player with the dealt cards
			return Promise.map(players, function(player) {
				return player.dealCards(gameId)
			})
		})
		.then(function(updatedPlayers) {
			//create or update player's hand in firebase
			//player's hand will be in separate 'child' node so it can be private
			return Promise.map(updatedPlayers, function(player) {
				return firebaseHelper.getConnection(player.game).child(player._id).child('hand').set(player.hand)
			})
		})
		.then(function() {
			res.status(201).send(gameId)
		})
		.then(null, next)
	}
	else {
		res.status(400).send('Unable to deal cards');
	}
})

//check to see if all players in game in ready state
router.get('/:gameId/ready', function(req, res, next) {
	var gameId = req.params.gameId;
	Player.find({game: gameId})
	.then(function(players) {
		//function to check to see if all players are in ready state?
		//if all players in ready state, kick off game logic?
	})
})

module.exports = router;










