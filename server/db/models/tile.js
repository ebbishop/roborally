var mongoose = require('mongoose');

var edges = ['wall0', 'wall1', 'wall2', 'wall3', 'push1', 'push2'];

var conveyorSchema = new mongoose.Schema({
  type:{
    type: String,
    enum: ['straight', 'clockwise', 'counterclock', 'merge1CCW', 'merge1CW', 'merge2'],
    required: true
  },
  magnitude: {
    type: Number,
    enum: [1,2],
    required: true
  },
  destination:{ //describes orientation
    type: String,
    enum: ['N', 'E', 'S', 'W'],
    required: true
  }
});

var tileSchema = new mongoose.Schema({
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
    conveyor: conveyorSchema,
    flag: {
      type: Number,
      enum: [1,2,3,4,5,6,7,8],
      required: false
    }
});

mongoose.model('Tile', tileSchema);

// may have max 3 edges
tileSchema.pre('save', function (next) {
  var edges = [this.edgeN, this.edgeE, this.edgeS, this.edgeW];
  if(edges.indexOf(null)===-1){
    this.invalidate('edges', 'may not have more than 3 edges');
    next(new Error('may not have more than 3 edges'));
  } else{
    next();
  }
});

// may not have a floor AND a conveyor belt
tileSchema.pre('save', function (next) {
  if(this.floor !== null && this.conveyor !==null){
    this.invalidate('floor', 'may not have both a floor and conveyor belt');
    next( new Error('tiles may not have both a floor and a conveyor belt'));
  }
});

function hasEdge (edges){
  for (var i = 0; i < edges.length; i ++){
    if (edges[i]) return true;
  }
  return false;
}

// pits can have no other information on them
tileSchema.pre('save', function (next){
  var edges = [this.edgeN, this.edgeE, this.edgeS, this.edgeW];
  if(this.floor === 'pit'){
    if(this.conveyor || this.flag || hasEdge(edges)){
      this.invalidate('floor', 'pits may contain no other information');
      next( new Error('pits may contain no other information'));
    }
  }
});

// must be unique
tileSchema.pre('save', function (next) {
  var self = this;
  this.findOne(this)
  .then(function(tile){
    if(tile){
      self.invalidate('this', 'each tile must be unique');
      next( new Error('each tile must be unique'));
    }else{
      next();
    }
  });
});
