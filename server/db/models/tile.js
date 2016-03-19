var Sequelize = require('sequelize');

function Tile(db){
  var Tile = db.define('Tile', {
    edgeN: {
      type: Sequelize.ENUM('wall0', 'wall1', 'wall2', 'wall3', 'push1', 'push2'),
      allowNull: true,
      defaultValue: null
    },
    edgeE:{
      type: Sequelize.ENUM('wall0', 'wall1', 'wall2', 'wall3', 'push1', 'push2'),
      allowNull: true,
      defaultValue: null
    },
    edgeS:{
      type: Sequelize.ENUM('wall0', 'wall1', 'wall2', 'wall3', 'push1', 'push2'),
      allowNull: true,
      defaultValue: null
    },
    edgeW:{
      type: Sequelize.ENUM('wall0', 'wall1', 'wall2', 'wall3', 'push1', 'push2'),
      allowNull: true,
      defaultValue: null
    },
    floor:{
      type: Sequelize.ENUM('pit', 'barefloor', 'gearCW', 'gearCCW', 'wrench1', 'wrench2'),
      allowNull: false,
      defaultValue: 'barefloor'
    },
    // conveyor:
    flag: {
      type: Sequelize.ENUM(1,2,3,4,5,6,7,8),
      allowNull: true,
      defaultValue: null
    }
  });

  return Tile;
};

module.exports = Tile;
