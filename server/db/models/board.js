var Sequelize = require('sequelize');

function Board(db){
  var Board = db.define('Board', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Board'
    },
    row00: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row01: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row02: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row03: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row04: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row05: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row06: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row07: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row08: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row09: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row10: {type: Sequelize.ARRAY(Sequelize.UUID)},
    row11: {type: Sequelize.ARRAY(Sequelize.UUID)}
  });
  return Board;
}

module.exports = Board;
