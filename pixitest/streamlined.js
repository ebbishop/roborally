var stage = new PIXI.Stage(0x66ff99);
var renderer = new PIXI.CanvasRenderer(1800,1800);

document.body.appendChild(renderer.view);

//all image files are 150px. Do not change this number!
var imgSizeActual = 150 

//factor to rescale images by. This number can be changed
var imgScale = 4 

var imgSize = imgSizeActual/imgScale

var tileImg = {
"0": {"image":"repair.jpg"},
"1": {"image":"option.jpg"},
"2": {"image":"empty.jpg"},
"3": {"image":"void.jpg"},
"4": {"image":"roller-express-wn.jpg"},
"5": {"image":"roller-express-south.jpg"},
"6": {"image":"roller-express-es.jpg"},
"7": {"image":"roller-express-sw.jpg"},
"8": {"image":"roller-express-se.jpg"},
"9": {"image":"roller-express-west.jpg"},
"10": {"image":"roller-express-north.jpg"},
"11": {"image":"roller-express-east.jpg"},
"12": {"image":"roller-east.png"},
"13": {"image":"roller-west.png"},
"18": {"image":"spinner-clockwise.jpg"},
"19": {"image":"spinner-counterclockwise.jpg"}
};

var walls = {
  "noLaser": "wall.png",

  //images related to lasers that are on the north or east walls
  "oneLaserNE": "laser-single-NE.png",
  "twoLasersNE": "laser-double-NE.png",
  "threeLasersNE": "laser-triple-NE.png",

  //images related to lasers that are on the south or west walls,
  "oneLaserSW": "laser-single-SW.png",
  "twoLasersSW": "laser-double-SW.png",
  "threeLasersSW": "laser-triple-SW.png",

  map: [
  //row, col, direction, number of lasers
    [0,2,"north", 0], [0,4,"north", 0], [0,7,"north", 0], [0,9,"north", 0],
    [2,0,"west", 0], [2,3,"south", 0], [2,11,"east", 0],
    [3,5,"west", 0], [3,6,"east", 1],
    [4,0,"west", 0], [4,11,"east", 0],
    [5,8,"north", 1],
    [6,3,"south", 1], 
    [7,0,"west", 0], [7,11,"east", 0],
    [8,5,"west", 1], [8,6,"east", 0],
    [9,0,"west", 0], [9,8,"north", 0], [9,11,"east", 0],
    [11,2,"south", 0], [11,4,"south", 0], [11,7,"south", 0], [11,9,"south", 0]
  ],
  getWallImg: function(coordinate) {
    var direction = coordinate[2];
    var numLasers = coordinate[3];
    var laserImgFile;
    var wallSrc;

    if(direction === "north" || direction === "east") laserImgFile = "NE";
    else laserImgFile = "SW"
    
    if (numLasers === 1) wallSrc = walls["oneLaser" + laserImgFile];
    else if (numLasers === 2) wallSrc = walls["twoLasers" + laserImgFile];
    else if (numLasers === 3) wallSrc = walls["threeLasers" + laserImgFile];
    else wallSrc = walls.noLaser
    return wallSrc;
  }
}

var lasers = {
  map: [ 
  //start, end, vertical or horizontal
  [[6,3], [5,3], "h"],
  [[8,5], [8,8], "v"],
  [[3,6], [3,2], "v"],
  [[5,8], [6,8], "h"]
  ]
}

var tiles = {
  cols: 12,
  rows: 12,
  map: [
    2,2,2,2,2,2,2,2,2,2,2,2,
    2,8,11,11,6,2,2,8,11,11,6,2,
    2,10,18,2,5,19,2,10,18,2,5,2,
    2,10,0,18,5,2,2,10,1,18,5,2,
    2,4,9,9,7,2,19,4,9,9,7,2,
    2,2,2,2,19,2,2,2,2,19,2,2,
    2,2,19,2,2,2,2,19,2,2,2,2,
    2,8,11,11,6,19,2,8,11,11,6,2,
    2,10,18,1,5,2,2,10,18,0,5,2,
    2,10,2,18,5,2,19,10,2,18,5,2,
    2,4,9,9,7,2,2,4,9,9,7,2,
    2,2,2,2,2,2,2,2,2,2,2,2
  ],
  getTileImg: function(col, row){
    var tileId = this.map[row * this.rows + col].toString();
    var tileSrc = tileImg[tileId].image;
    return tileSrc;
  }
};

function buildMap(){
  buildTiles();
  buildWalls();
  drawLasers();
}

function buildTiles() {
  for (var col = 0; col < tiles.cols; col ++){
    for (var row = 0; row < tiles.rows; row ++){
      var tileSrc = tiles.getTileImg(col, row);
                                                          //150x150 is the actual image size
      var tile = new PIXI.extras.TilingSprite.fromImage(tileSrc, imgSizeActual, imgSizeActual)
      
      tile.position.x = imgSize*col
      tile.position.y = imgSize*row;
      //rescales the 150px tile image to be 4 times smaller 
      tile.scale.set(1/imgScale, 1/imgScale);

      stage.addChild(tile)
    }
  }
}

function buildWalls() {
  for(var i = 0; i < walls.map.length; i++) {
    var wallSrc = walls.getWallImg(walls.map[i])
    var wall = new PIXI.Sprite(PIXI.Texture.fromImage(wallSrc))

    wall.position.x = imgSize*walls.map[i][1];
    wall.position.y = imgSize*walls.map[i][0];
    wall.scale.set(1/imgScale, 1/imgScale);

    if(walls.map[i][2] === "west") {
      wall.rotation = Math.PI/2
      if(walls.map[i][3] > 0) wall.position.x = wall.position.x + 37.5
      else wall.position.x = wall.position.x + 5
    } 
    else if (walls.map[i][2] === "south") {
      if(walls.map[i][3] === 0) wall.position.y = wall.position.y + imgSize - 5      
    } 
    else if (walls.map[i][2] === "east") {
      wall.rotation = Math.PI/2
      wall.position.x = wall.position.x + 37.5      
    }

    stage.addChild(wall);
  }
}

function drawLasers() {
  if(lasers) {
    for(var i = 0; i < lasers.map.length; i++) {
      var line = new PIXI.Graphics;
      var xFrom, yFrom, xTo, yTo;
      if(lasers.map[i][2] === "h" && lasers.map[i][0][0] > lasers.map[i][1][0]) {
        xFrom = lasers.map[i][0][0] + 0.7
        yFrom = lasers.map[i][0][1] + 0.5
        xTo = lasers.map[i][1][0] + 0.1
        yTo = lasers.map[i][1][1] + 0.5
      }
      else if(lasers.map[i][2] === "h") {
        xFrom = lasers.map[i][0][0] + 0.3
        yFrom = lasers.map[i][0][1] + 0.5
        xTo = lasers.map[i][1][0] + 0.9
        yTo = lasers.map[i][1][1] + 0.5
      }
      else if(lasers.map[i][2] === "v" && lasers.map[i][0][1] > lasers.map[i][1][1]) {
        xFrom = lasers.map[i][0][0] + 0.5
        yFrom = lasers.map[i][0][1] + 0.7
        xTo = lasers.map[i][1][0] + 0.5
        yTo = lasers.map[i][1][1] + 1
      }
      else {
        xFrom = lasers.map[i][0][0] + 0.5
        yFrom = lasers.map[i][0][1] + 0.1
        xTo = lasers.map[i][1][0] + 0.5
        yTo = lasers.map[i][1][1] + 1
      }

      line.lineStyle(1, 0xff0000)
      line.moveTo(xFrom*37.5, yFrom*37.5)
      line.lineTo(xTo*37.5, yTo*37.5)

      stage.addChild(line)
    }
  }
}

function init(){
  renderer.render(stage);
}


buildMap();
