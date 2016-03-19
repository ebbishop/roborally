var express = require('express');
var router = express.Router();

router.use('/board', require('./board'));
router.use('/game', require('./game'));

module.exports = router;