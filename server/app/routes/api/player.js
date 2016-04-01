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

router.get('/:playerId', function(req, res) {
	res.json(req.player)
})

router.post('/', function(req, res, next) {
	var name = req.body.params.data.playerName
	var robot = req.body.params.data.robot.name
	var gameID = req.body.params.id
	var currentGame = firebaseHelper.getConnection(gameID)


	// console.log('this is body', req.body)

	var playerKey;
	Player.create({name: name, robot: robot})
	.then(function(player) {
		playerKey = player._id.toString()
		return Game.findByIdAndUpdate(gameID, {$addToSet: {players: player}})
	})
	.then(function(game){
		return Game.findById(game._id)
		.populate('players')
	})
	.then(function(updatedGame) {
		currentGame.child('game').set(updatedGame.toObject())
		res.status(201).json({game: updatedGame, playerId: playerKey})
	})
	.then(null, next)
})

//each player selects cards and sets register
//sending register to firebase --> might not need it?
router.put('/:playerId/setcards', function(req, res, next) {
	var cards = req.body.register;
	var gameId = req.body.gameId;

	req.player.register = cards;
	req.player.iAmReady();

	req.player.save()
	.then(function(p){
		return Game.findById(gameId).populate('players');
	})
	.then(function(updatedGame) {
		console.log('updated game', updatedGame.players[0])
		firebaseHelper.getConnection(gameId).child('game').set(updatedGame.toObject())
		res.end()
	})
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

