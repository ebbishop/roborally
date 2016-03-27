app.controller('GameCtrl', function($scope, $state, theGame){

	// window.start()
	$scope.game = theGame;
	$scope.boardObj = $scope.game.board

	function collectOneCol(n){
	var key = 'col' + n.toString();
	var idents = $scope.boardObj[key].map(function(tile){
	  return tile.identifier;
	});
	return idents;
	}

	$scope.board = [];
	for(var i = 11; i >= 0; i --){
		$scope.board.push(collectOneCol(i));
	}


    var stage = new PIXI.Container();
    var renderer = PIXI.autoDetectRenderer(640,480);
    document.getElementById("mainContainer").appendChild(renderer.view);

    var imgSizeActual = 150 

	//factor to rescale images by. This number can be changed
	var imgScale = 3.75 

	var imgSize = imgSizeActual/imgScale
	var cols = 12;
	var rows = 16;

	function drawDockLine() {
	  var line = new PIXI.Graphics;
	  line.lineStyle(4, 0x000000, 1);
	  line.moveTo(12*imgSizeActual/imgScale, 0)
	  line.lineTo(12*imgSizeActual/imgScale, 12*imgSizeActual/imgScale)

	  stage.addChild(line)
	}

	function buildTiles() {
	  for (var col = 0; col < cols; col ++){
	    for (var row = 0; row < rows; row ++){
	      var tileSrc = '/img/tiles/' + $scope.board[col][row] + '.jpg';
	                                                          //150x150 is the actual image size
	      var tile = new PIXI.extras.TilingSprite.fromImage(tileSrc, imgSizeActual, imgSizeActual)
	      
	      tile.position.x = imgSize*row
	      tile.position.y = imgSize*cols - imgSize - imgSize * col;
	      //rescales the 150px tile image to be 4 times smaller 
	      tile.scale.set(1/imgScale, 1/imgScale);

	      stage.addChild(tile)
	    }
	  }
	}
	buildTiles();
	drawDockLine();

	function buildMap(){
	  renderer.render(stage);
	  requestAnimationFrame(buildMap);
	}
	if($scope.game) {

		buildMap();
	}

});

