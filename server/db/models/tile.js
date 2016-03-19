var mongoose = require('mongoose');

var edges = {
  values: ['wall0', 'wall1', 'wall2', 'wall3', 'push1', 'push2'],
  message: 'enum validator failed for path edges with value `{VALUE}`'
};

var schema = new mongoose.Schema({
    edgeN: {
      type: String,
      enum: edges,
      required: false
    },
    edgeE:{
      type: String,
      enum: edges,
      required: false
    },
    edgeS:{
      type: String,
      enum: edges,
      required: false
    },
    edgeW:{
      type: String,
      enum: edges,
      required: false
    },
    floor:{
      type: String,
      enum: ['pit', 'barefloor', 'gearCW', 'gearCCW', 'wrench1', 'wrench2'],
      required: false
    },
    conveyor: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    flag: {
      type: Number,
      enum: [1,2,3,4,5,6,7,8],
      required: false
    }
});

mongoose.model('Tile', schema);

