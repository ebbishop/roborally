var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Promise = require('bluebird');
var firebaseHelper = require("../../../firebase");

var Game = mongoose.model('Game');
var Player = mongoose.model('Player');

//URL: /api/player

router.param('gameId', function(req, res, next, gameId) {
	Game.findById(gameId)
	.then(function(game) {
		req.game = game;
		next()
	})
	.then(null, next)
})

router.param('playerId', function(req, res, next, playerId) {
	Player.findById(playerId)
	.then(function(player) {
		req.player = player;
		next()
	})
	.then(null, next)
})

//each player selects cards and sets register
router.put('/:playerId/cards', function(req, res, next) {
	req.player.setRegister(req.body)
	.then(function() {
		res.sendStatus(201)
	})
	.then(null, next)
})

//sets ready status of player to True after cards are registered
//after each player is ready, send state of game to Firebase?
router.put('/:playerId/ready', function(req, res, next) {
	req.player.iAmReady(req.player.register)
	.then(function() {
		res.sendStatus(201)
	})
	.then(null, next)
})

module.exports = router;

