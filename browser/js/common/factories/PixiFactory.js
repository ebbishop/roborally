app.factory('PixiFactory', function($rootScope){
  var PixiFactory = {};

  /*columns rendered horizontally as the board orientation is:
    E
  N   S
    W
  */

  function collectOneCol(colNum, boardObj){
    var key = 'col' + colNum.toString();
    var idents = boardObj[key].map(function(tile){
      return tile.identifier;
    });
    return idents;
  }

  PixiFactory.createBoardArr = function(boardObj){
      var board = [];
      for(var i = 0; i < $rootScope.cols; i++) {
        board.push(collectOneCol(i, boardObj))
      }
      return board;
    }

  PixiFactory.drawBoard = function(board, stage) {
      for(var col = 0; col < $rootScope.cols; col++) {
        for(var row = 0; row < $rootScope.rows; row++) {
          var tileSrc = board[col][row] + '.jpg';
          var tile = PixiFactory.createTileSprite(tileSrc);
          tile.position.x = $rootScope.imgSize * row;
          tile.position.y = $rootScope.imgSize * ($rootScope.cols - 1 - col);
          tile.scale.set(1/$rootScope.imgScale, 1/$rootScope.imgScale);
          stage.addChild(tile);
        }
      }
    }

  PixiFactory.pixiInitializer = function() {
    var stage = new PIXI.Container();
    var renderer = PIXI.autoDetectRenderer($rootScope.imgSize * $rootScope.rows,  $rootScope.imgSize * $rootScope.cols)

    var loader = PIXI.loader;
    loader.add("img/spritesheet.json");

    return {
      stage: stage,
      renderer: renderer,
      loader: loader
    }
  };

  PixiFactory.createTileSprite = function(tileSrc) {
    return new PIXI.Sprite(PIXI.loader.resources["img/spritesheet.json"].textures[tileSrc]);
  }

  PixiFactory.drawDocks = function (docks, stage) {
    for(var i = 0; i < docks.length; i++) {
      var dockNum = i+1;
      var dock = new PIXI.Text(dockNum.toString(), {font : '24px Arial', fill : 0x000000, align : 'center'});
      dock.position.x = docks[i][0]* $rootScope.imgSize + 18;
      dock.position.y = docks[i][1]* $rootScope.imgSize + 9;
      stage.addChild(dock);
    }
  }

  PixiFactory.drawDockLine = function (stage) {
    var line = new PIXI.Graphics;
    line.lineStyle(4, 0x000000, 1);
    line.moveTo(12* $rootScope.imgSizeActual/$rootScope.imgScale, 0)
    line.lineTo(12* $rootScope.imgSizeActual/$rootScope.imgScale, 12* $rootScope.imgSizeActual/$rootScope.imgScale)
    stage.addChild(line);
  }

  return PixiFactory;
});
