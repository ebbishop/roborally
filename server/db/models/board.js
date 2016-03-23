var mongoose = require('mongoose');

// for now, let's organize  boards by column because all possibilities
// are only 12 wide, may be a variable height depending on the course

// ***this ignores the crazy courses at the expert levels.
// maybe we don't want to make it endlessly flexible? ***

var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Board'
  },
  col0: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col1: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col2: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col3: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col4: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col5: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col6: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col7: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col8: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col9: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col10: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  col11: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}]
});

mongoose.model('Board', schema);
schema.set('versionKey',false );

schema.methods.getTileAt = function (row, col) {
  var key = 'col' + col.toString();
  return this[key][row].populate();
};
