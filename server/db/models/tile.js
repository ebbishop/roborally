var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var edges = [null, 'wall0', 'wall1', 'wall2', 'wall3', 'push1', 'push2'];

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
  bearing:{ //describes orientation
    type: [mongoose.Schema.Types.Mixed]
  }
});

var tileSchema = new mongoose.Schema({
  identifier: {
      type: Number,
      required: true
  },
  edgeN: {
    type: String,
    enum: edges,
  },
  edgeE:{
    type: String,
    enum: edges,
  },
  edgeS:{
    type: String,
    enum: edges,
  },
  edgeW:{
    type: String,
    enum: edges,
  },
  floor:{
    type: String,
    enum: [null, 'pit', 'barefloor', 'gearCW', 'gearCCW', 'wrench1', 'wrench2'],
  },
  conveyor: [conveyorSchema],
  flag: {
    type: Number,
    enum: [null, 1,2,3,4],
  }
});

tileSchema.plugin(deepPopulate);
mongoose.model('Tile', tileSchema);

// // may have max 3 edges
// tileSchema.pre('save', function (next) {
//   var edges = [this.edgeN, this.edgeE, this.edgeS, this.edgeW];
//   if(edges.indexOf(null)===-1){
//     this.invalidate('edges', 'may not have more than 3 edges');
//     next(new Error('may not have more than 3 edges'));
//   } else{
//     next();
//   }
// });

// // may not have a floor AND a conveyor belt
// tileSchema.pre('save', function (next) {
//   if(this.floor !== null && this.conveyor !==null){
//     this.invalidate('floor', 'may not have both a floor and conveyor belt');
//     next( new Error('tiles may not have both a floor and a conveyor belt'));
//   }
//   next();
// });

// function hasEdge (edges){
//   for (var i = 0; i < edges.length; i ++){
//     if (edges[i]) return true;
//   }
//   return false;
// }

// // pits can have no other information on them
// tileSchema.pre('save', function (next){
//   var edges = [this.edgeN, this.edgeE, this.edgeS, this.edgeW];
//   if(this.floor === 'pit'){
//     if(this.conveyor || this.flag || hasEdge(edges)){
//       this.invalidate('floor', 'pits may contain no other information');
//       next( new Error('pits may contain no other information'));
//     }
//     next();
//   }
//   next();
// });



// to prevent insanity, each tile must be unique  THIS DOESN'T CURRENTLY FUNCTION
// tileSchema.pre('save', function (next) {
//   var self = this;
//   // console.log('looking for tile like this:', self);

//   if(self.conveyor){
//     mongoose.model('Tile').find({'edgeN': self.edgeN, 'edgeE': self.edgeE, 'edgeS': self.edgeS, 'edgeW': self.edgeW, 'floor': self.floor,'flag': self.flag})
//     .where({'conveyor': {type: self.conveyor.type, magnitude: self.conveyor.magnitude, destination: self.conveyor.destination}})
//     .then(function(tiles){

//       // console.log('tiles found:', tiles);
//       if(tiles.length){
//         self.invalidate('this', 'each tile must be unique');
//         next( new Error('each tile must be unique'));
//       }else{
//         // console.log('no error in hook4');
//         next();
//       }

//     }, next);
//   }else{

//     mongoose.model('Tile').find({
//       edgeN: self.edgeN, edgeE: self.edgeE, edgeS: self.edgeS, edgeW: self.edgeW, floor: self.floor,
//       conveyor: null, flag: self.flag})
//     .then(function(tiles){

//       console.log('tiles found:', tiles);
//       if(tiles.length){
//         self.invalidate('this', 'each tile must be unique');
//         next( new Error('each tile must be unique'));
//       }else{
//         console.log('no error in hook4 otherway');
//         next();
//       }

//     }, next);
//   }

// });
