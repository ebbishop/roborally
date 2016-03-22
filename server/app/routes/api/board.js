var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')

var Board = mongoose.model('Board')

//URL: /api/board

//get all the boards so player to see all board options
router.get('/', function(req, res, next) {
	Board.find({})
	.then(function(boards) {
		res.json(boards)
	})
	.then(null, next)
})

//get board selected by player
router.get('/:id', function(req, res, next) {
	var id = req.params.id
	Board.findById(id)
	.then(function(board) {
		res.json(board)
	})
	.then(null, next)
})

module.exports = router;