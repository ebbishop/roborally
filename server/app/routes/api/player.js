var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Promise = require('bluebird');
var firebaseHelper = require("../../../firebase/firebase.js");

var Game = mongoose.model('Game');
var Player = mongoose.model('Player');

var firebaseHelper = require("../../../firebase/firebase.js");

//URL: /api/player

router.param('playerId', function(req, res, next, playerId) {
	Player.findById(playerId)
	.then(function(player) {
		req.player = player;
		next()
	})
	.then(null, next)
})

router.post('/', function(req, res, next) {
	var name = req.body.params.data.playerName
	var robot = req.body.params.data.robot.name
	var gameID = req.body.params.id
	Player.create({name: name, robot: robot})
	.then(function(player) {
		var playerKey = player._id.toString()
		var currentGame = firebaseHelper.getConnection(gameID)
		currentGame.child(playerKey).set(player.toObject())
		return Game.findByIdAndUpdate(gameID, {$addToSet: {players: player}})
	})
	.then(function(game){
		return Game.findById(game._id)
		.populate('players')
	})
	.then(function(updatedGame) {
		res.status(201).json(updatedGame)
	})
	.then(null, next)
})

//each player selects cards and sets register
//sending register to firebase --> might not need it?
router.put('/:playerId/setcards', function(req, res, next) {
	req.player.setRegister(req.body)
	.then(function(register) {
		firebaseHelper.getConnection(req.player.game).child(req.player._id).child('register').set(register)
		res.status(201).send(req.player.game)
	})
	.then(null, next)
})

//sets ready status of player to True after cards are registered
router.put('/:playerId/ready', function(req, res, next) {
	req.player.iAmReady(req.player.register)
	.then(function() {
		res.sendStatus(201)
	})
	.then(null, next)
})

//empty register
//sending register to firebase --> might not need it?
router.put('/:playerId/emptycards', function(req, res, next) {
	req.player.emptyRegister()
	.then(function() {
		firebaseHelper.getConnection(req.player.game).child(req.player._id).child('register').set(null)
		res.status(201).send(req.player.game)
	})
	.then(null, next)
})

module.exports = router;

