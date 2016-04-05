app.factory('RobotFactory', function($rootScope, UtilsFactory) {
  function getRobotImage(robotName) {
    return robotName.toLowerCase().replace(/ /g,'') + 'Arrow.png';
  };

  function createOneRobotSprite(player, robotHash, pixi) {
    var robotImg = getRobotImage(player.robot);
    var robot = new PIXI.Sprite(pixi.loader.resources["img/spritesheet.json"].textures[robotImg]);

    robot.anchor.x = 0.5;
    robot.anchor.y = 0.5;
    robot.position.x = $rootScope.imgSize*(player.position[0] + 0.5);
    robot.position.y = $rootScope.imgSize*(11-player.position[1] + 0.5);
    robot.scale.set(1/$rootScope.imgScale, 1/$rootScope.imgScale);
    console.log('drawing robot at', player.position, 'facing', player.bearing);
    //check bearing of player
    if(player.bearing[2]!=='N') {
      var newRotation = UtilsFactory.getRotation([-1,0], player.bearing)
      robot.rotation = newRotation;
    }

    pixi.stage.addChild(robot);
    robotHash[player.name] = robot;
    robotHash[player.name].bearing = player.bearing;
    robotHash[player.name].location = player.position;
    pixi.renderer.render(pixi.stage)

  };

  var RobotFactory = {}

  RobotFactory.createAllRobotSprites = function(phase, robotHash, pixi) {
    phase.players.forEach(function(player){
      if(robotHash[player.name] === undefined) createOneRobotSprite(player, robotHash, pixi);
    })
  }

  return RobotFactory;
});

