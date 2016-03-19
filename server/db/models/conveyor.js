var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  type:{
    type: String,
    enum: ['straight', 'clockwise', 'counterclock', 'merge1left', 'merge1right', 'merge2'],
    required: true,
    default: 'straight'
  },
  magnitude: {
    type: Number,
    enum: [1,2],
    required: true,
    default: 1
  },
  destination:{
    type: String,
    enum: ['N', 'E', 'S', 'W'],
    required: true,
    default: 'N'
  }
});


mongoose.model('Conveyor', schema);
