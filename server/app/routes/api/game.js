var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')

require('../../../db/models/game');
var Game = mongoose.model('Game');
var Player = mongoose.model('Player');
var Card = mongoose.model('Card');

//URL: /api/game

router.param('gameId', function(req, res, next, gameId) {
	Game.findById(gameId)
	.then(function(game) {
		req.game = game;
		next()
	})
	.then(null, next)
})

//new game
router.post('/', function(req, res, next) {
	Game.create(req.body)
	.then(function(newGame) {
		res.status(201).json(newGame)
	}
	.then(null, next)
})

//choosing robot (assuming it's on Player model)
//adding player to a game?
router.post('/:gameId/join', function(req, res, next) {
	Player.create(req.body)
	.then(function(newPlayer) {
		//method on game to add a player to the specified game?
		return req.game.addPlayer(newPlayer)
	})
	.then(function() {
		res.sendStatus(201)
	})
	.then(null, next)
})

//get a game
router.get('/:gameId', function(req, res) {
	res.json(req.game)
})

//deal cards
router.get('/:gameId/cards', function(req, res) {
	//method on game to deal cards for a specified game?
	req.game.dealCards()
	.then(function(cards) {
		res.json(cards)
	})
	.then(null,next)
})


//player chooses cards and clicks ready
//each round has 5 cards
router.post('/:gameId/round/:roundId', function(req, res, next) {


})










