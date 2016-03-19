var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')

require('../../../db/models/board');
var Board = mongoose.model('Board')

//URL: /api/board

router.get('/:id', function(req, res, next) {
	var id = req.params.id
	Board.findById(id)
	.then(function(board) {
		res.json(board)
	})
	.then(null, next)
})

module.exports = router;