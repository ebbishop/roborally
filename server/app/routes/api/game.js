var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Promise = require('bluebird');
var firebaseHelper = require("../../../firebase/firebase.js");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var Game = mongoose.model('Game');
var Player = mongoose.model('Player');

//URL: /api/game

router.param('gameId', function(req, res, next, gameId) {
	Game.findById(gameId).deepPopulate(['board.col0', 'board.col1', 'board.col2', 'board.col3', 'board.col4',
        'board.col5', 'board.col6', 'board.col7', 'board.col8', 'board.col9', 'board.col10',
        'board.col11', 'players.player', 'host']).exec()
	.then(function(game) {
		req.game = game;
		next()
	})
	.then(null, next)
})

router.post('/', function(req, res, next) {
	Player.create({name: req.body.playerName, robot: req.body.robot.name})
	.then(function(player) {
		return Game.create({name: req.body.gameName, players: player._id, host: player._id, board: req.body.board._id})
	})
	.then(function(game){
		return Game.findById(game._id)
		.populate('players host')
	})
	.then(function(updatedGame) {
		var playerKey = updatedGame.host._id.toString()
		var newGame = firebaseHelper.getConnection(updatedGame._id)
		newGame.child('game').set(updatedGame.toObject())
		newGame.child(playerKey).set(updatedGame.host.toObject())
		res.status(201).json(updatedGame)
	})
	.then(null, next)
})

//get game
router.get('/:gameId', function(req, res) {
	res.json(req.game)
})

router.get('/:gameId/start', function(req, res, next) {
	var state = req.game.state;
	var id = req.params.gameId;
	var game = firebaseHelper.getConnection(id);
	req.game.set({state: 'decision'});

	req.game.save()
	.then (function(updatedGame) {
		updatedGame.initializeGame();
		return Promise.all([Promise.map(updatedGame.players, function(player){
			return player.save()
		}),updatedGame.save()]);
	})
	.then(function(){
		res.send(id);
	})
})

//check to see if all players in game in ready state
router.get('/:gameId/ready', function(req, res, next) {
	console.log('hit ready route');
	Game.findById(req.game._id)
	.deepPopulate(['board.col0', 'board.col1', 'board.col2', 'board.col3', 'board.col4',
        'board.col5', 'board.col6', 'board.col7', 'board.col8', 'board.col9', 'board.col10',
        'board.col11', 'players.player', 'host']).exec()
	.then(function(updatedGame) {
		return updatedGame.runOneRound()
	})
	.then(null, console.error)
	.then(function(){
		res.send('front-end after runOneRegister')
	})
})

module.exports = router;





