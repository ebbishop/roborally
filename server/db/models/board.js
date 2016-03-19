var mongoose = require('mongoose');


var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Board'
  },
  row00: [mongoose.Schema.Types.ObjectId],
  row01: [mongoose.Schema.Types.ObjectId],
  row02: [mongoose.Schema.Types.ObjectId],
  row03: [mongoose.Schema.Types.ObjectId],
  row04: [mongoose.Schema.Types.ObjectId],
  row05: [mongoose.Schema.Types.ObjectId],
  row06: [mongoose.Schema.Types.ObjectId],
  row07: [mongoose.Schema.Types.ObjectId],
  row08: [mongoose.Schema.Types.ObjectId],
  row09: [mongoose.Schema.Types.ObjectId],
  row10: [mongoose.Schema.Types.ObjectId],
  row11: [mongoose.Schema.Types.ObjectId]
});

mongoose.model('Board', schema);
