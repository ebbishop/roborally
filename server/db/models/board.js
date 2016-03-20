var mongoose = require('mongoose');


var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Board'
  },
  row0: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row1: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row2: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row3: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row4: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row5: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row6: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row7: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row8: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row9: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row10: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  row11: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}]
});

mongoose.model('Board', schema);


schema.methods.getTileAt = function (row, col) {
  var key = 'row' + row.toString();
  return this[key][col];
};
