var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['U-Turn', 'Rotate Left', 'Rotate Right', 'Back Up', 'Move 1', 'Move 2', 'Move 3'],
    required: true
  },
  rotation: {
    type: Number,
    enum: [-90, 0, 90, 180],
    required: true
  },
  forward: {
    type: Number,
    enum: [-1, 0, 1],
    required: true
  },
  magnitude: {
    type: Number,
    enum: [0,1,2,3],
    required: true
  },
  priority: Number
});

mongoose.model('Card', schema);
