var mongoose = require('mongoose');


var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Board'
  },
  row00: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row01: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row02: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row03: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row04: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row05: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row06: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row07: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row08: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row09: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row10: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row11: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}]
});

mongoose.model('Board', schema);
