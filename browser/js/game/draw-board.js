window.start = function(){
  document.getElementById("board").appendChild(renderer.view);
}

var stage = new PIXI.Stage(0x66ff99);
var renderer = new PIXI.CanvasRenderer(640,480);

//all image files are 150px. Do not change this number!
var imgSizeActual = 150 

//factor to rescale images by. This number can be changed
var imgScale = 3.75 

var imgSize = imgSizeActual/imgScale
var cols = 12;
var rows = 16;
var board = {
          col0: [1, 13, 5, 11, 5, 1, 1, 5, 13, 5, 1, 30, 1, 1, 1, 1],
          col1: [4, 100, 1, 11, 1, 1, 1, 90, 13, 1, 52, 2, 1, 1, 5, 1],
          col2: [2, 13, 36, 11, 1, 60, 1, 1, 13, 60, 1, 1, 2, 1, 1, 4], 
          col3: [1, 13, 4, 1, 40, 41, 96, 1, 41, 10, 10, 10, 1, 1, 5, 1], 
          col4: [2, 13, 93, 71, 1, 1, 13, 1, 1, 50, 1, 4, 2, 1, 1, 4],
          col5: [12, 15, 41, 71, 1, 1, 13, 60, 93, 1, 5, 1, 1, 1, 5, 1],
          col6: [10, 10, 40, 71, 1, 36, 22, 10, 40, 10, 10, 10, 1, 1, 5, 1],
          col7: [2, 1, 1, 71, 1, 12, 41, 1, 3, 36, 1, 4, 2, 1, 5, 4],
          col8: [1, 1, 1, 71, 1, 8, 11, 1, 1, 60, 1, 1, 1, 1, 1, 1],
          col9: [2, 1, 3, 87, 70, 74, 11, 1, 13, 13, 1, 51, 2, 1, 5, 4],
          col10: [1, 60, 4, 71, 1, 88, 11, 1, 13, 19, 10, 10, 1, 1, 1, 1],
          col11: [30, 1, 3, 71, 3, 73, 11, 53, 73, 3, 1, 1, 1, 1, 5, 1]
        }


             
var boardArr = [];

function createBoardArr (boardObj) {
  for(var key in board) {
    if(key.slice(0,3) === 'col') boardArr.push(board[key])
  }
  return boardArr;
}

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
      var tileSrc = '/img/tiles/' + boardArr[col][row] + '.jpg';
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

function buildMap(){
  createBoardArr();
  buildTiles();
  drawDockLine();
}


function init(){
  renderer.render(stage);
}

buildMap();
