var express = require('express');
var router = express.Router();

router.use('/board', require('./board'));
router.use('/game', require('./game'));
router.use('/player', require('./player'));

module.exports = router;