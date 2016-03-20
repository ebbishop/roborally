var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Promise = require('bluebird');
var firebaseHelper = require("../../../firebase");

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

//click 'create new game'
//req.body will include board selection
//front-end note: state.go to the newly created board
//side note: will we have different courses for each board selection?
router.post('/', function(req, res, next) {
	Game.create(req.body)
	.then(function(newGame) {
		//start game will full deck of cards
		//assuming Game schema has a deck key that initially starts with all cards
		return newGame.initializeGame()
		.then(function(updatedGame) {
			//setting the firebase connection
			//https://resplendent-torch-4322.firebaseio.com/[game id]
			firebaseHelper.setConnection(updatedGame._id)
			res.sendStatus(201)
		})
	}
	.then(null, next)
})

//player selects robot and THEN clicks 'join game'
//req.body will include robot selection
//add player to game and assign game id to the player
router.post('/:gameId/player', function(req, res, next) {
	var gameId = req.params.gameId
	Player.create(req.body)
	.then(function(newPlayer) {
		newPlayer.set({game: gameId}).save()
	})
	.then(null, next)
})

//get game
router.get('/:gameId', function(req, res) {
	//send state of this game to all players --> Firebase
	firebaseHelper.getConnection().update() --> //?
	res.json(req.game)
})

//deal cards to all players in game when game is active and state is in 'decision' mode
//since all players in a game will need to be dealt cards after each round, I thought it made most sense to have this route in game
router.get('/:gameId/cards', function(req, res) {
	var gameId = req.params.gameId
	if (req.game.active === true && req.game.state === 'decision') {
		Player.find({game: gameId})
		.then(function(players) {
			//assuming dealCards is a method on the Player model
			//assuming dealCards updates currentHand of each player with the dealt cards
			return Promise.map(players, function(player) {
				return player.dealCards(gameId)
			})
		})
		.then(null, next)
	}
	else {
		res.status(400).send('Unable to deal cards');
	}
})

module.exports = router;










