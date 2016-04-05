app.factory('MoveFactory', function(UtilsFactory, $q, $rootScope){
  var MoveFactory = {};

  MoveFactory.playAllMoves = function(playerStates, robotHash, pixi){
    console.log('playing out', playerStates.length, 'state changes');
    return playerStates.reduce(function(acc, playerState, idx){
      var robot = robotHash[playerState.name];

      return acc.then(function(){
        return MoveFactory.calcRobotTurn(robot, playerState);
      })
      .then(function(){
        return MoveFactory.calcRobotMove(robot, playerState);
      })
      .then(function(){
        robotHash[playerState.name].bearing = playerState.bearing;
        robotHash[playerState.name].location = playerState.location;

        pixi.renderer.render(pixi.stage);
      })
    }, $q.resolve());

  };

  MoveFactory.calcRobotTurn = function(robot, player){
    var direction;
    if(UtilsFactory.arraysMatch(player.bearing, robot.bearing)) return $q.resolve();
    else{
      var changeInRotation = UtilsFactory.getRotation(robot.bearing, player.bearing);
      var endingRotation =  changeInRotation + robot.rotation;

      if(changeInRotation > 0) direction = 'clockwise';
      else direction = 'counterclockwise';
      console.log('turning', direction, 'from', robot.bearing, 'to', player.bearing);
      robot.bearing = player.bearing;
      return MoveFactory.promiseForTurnRobot(robot, endingRotation, direction)
    }
  };

  MoveFactory.promiseForTurnRobot = function(robot, endingRotation, direction){
    return $q(function(resolve, reject){
      MoveFactory.turn(robot, resolve, endingRotation, direction)
    })
  };

  MoveFactory.turn = function(robot, resolve, endingRotation, direction){
    if(robot.rotation < endingRotation && direction == 'clockwise'){
      direction = 'clockwise';
      robot.rotation += 0.03;
      requestAnimationFrame(MoveFactory.turn.bind(null, robot, resolve, endingRotation, direction))
    }else if(robot.rotation > endingRotation){
      direction = 'counterclockwise';
      robot.rotation -= 0.03;
      requestAnimationFrame(MoveFactory.turn.bind(null, robot, resolve, endingRotation, direction))
    }else{
      resolve();
    }
  };

  MoveFactory.calcRobotMove = function(robot, playerState){
    var endCol = 11 - playerState.location[1] + 0.5;
    var endRow = playerState.location[0] + 0.5;
    console.log('robot', robot)
    // console.log('rob loc and ps loc', robot.position.x, robot.position.y, playerState.location)
    console.log('robo pos arr', [robot.position.x/$rootScope.imgSize, robot.position.y/$rootScope.imgSize], playerState.location)
    if(UtilsFactory.arraysMatch([robot.position.x/$rootScope.imgSize, robot.position.y/$rootScope.imgSize], playerState.location.slice(0,2))) return $q.resolve();

    console.log('moving from', robot.location, 'to', playerState.location);

    robot.location = playerState.location;
    return MoveFactory.promiseForMoveRobot(robot, endRow, endCol);

  };

  MoveFactory.promiseForMoveRobot = function(robot, endRow, endCol){
    return $q(function(resolve, reject){
      MoveFactory.move(robot, resolve, endRow, endCol);
    })
  };

  MoveFactory.move = function(robot, resolve, endRow, endCol){
    if(robot.position.x >  $rootScope.imgSize * endRow){
      robot.position.x -= 1;
      requestAnimationFrame(MoveFactory.move.bind(null, robot, resolve, endRow, endCol));
    } else if (robot.position.x < $rootScope.imgSize * endRow){
      robot.position.x += 1;
      requestAnimationFrame(MoveFactory.move.bind(null, robot, resolve, endRow, endCol));
    } else if (robot.position.y > $rootScope.imgSize * endCol){
      robot.position.y -= 1;
      requestAnimationFrame(MoveFactory.move.bind(null, robot, resolve, endRow, endCol));
    } else if (robot.position.y < $rootScope.imgSize * endCol){
      robot.position.y += 1;
      requestAnimationFrame(MoveFactory.move.bind(null, robot, resolve, endRow, endCol))
    } else {
      resolve();
    }
  };

  MoveFactory.shootRobotLasers = function(){

  };

  return MoveFactory;
});
