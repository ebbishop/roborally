var Sequelize = require('sequelize');

function ConveyorBelt(db){
  var ConveyorBelt = db.define('ConveyorBelt', {
    id: {
      type: Sequelize.SERIAL
    },
    type:{
      type: Sequelize.ENUM('straight', 'clockwise', 'counterclock', 'merge1left', 'merge1right', 'merge2'),
      allowNull: false,
      defaultValue: 'straight'
    },
    magnitude: {
      type: Sequelize.ENUM(1,2),
      allowNull: false,
      defaultValue: 1
    },
    destination:{
      type: Sequelize.ENUM('N', 'E', 'S', 'W'),
      allowNull: false,
      defaultValue: 'N'
    }
  });
  return ConveyorBelt;
};

module.exports = ConveyorBelt;
