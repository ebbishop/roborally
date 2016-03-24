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
  col11: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tile'}],
  dockLocations: {
    type: [Array] //array of arrays [ [row, col], [row, col] ...]
    //this is the location of every docking number in order (8 docks)
    //      dock#1  dock#2  dock#3  dock#4  dock#5  dock#6   dock#7  dock#8
    //ex: [ [15,5], [15,6], [14,3], [14,8], [13,1], [13,10], [12,0], [12,11] ]     
  }
});

mongoose.model('Board', schema);
schema.set('versionKey',false );
