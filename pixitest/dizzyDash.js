var stage = new PIXI.Stage(0x66ff99);
var renderer = new PIXI.CanvasRenderer(1800,1800);

document.body.appendChild(renderer.view);

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
"19": {"image":"spinner-counterclockwise.jpg"},
"20": {"image":"laserHead.png"},
"21": {"image":"wall-center.png"}
};

var walls = {
  "north": "wall-north.png",
  "east": "wall-east.png",
  "south": "wall-south.png",
  "west": "wall-west.png",
  "center": "wall-center.png",
  map: [
  //row, col, direction
    [0,2,"north"], [0,4,"north"], [0,7,"north"], [0,9,"north"],
    [2,0,"west"], [2,3,"south"], [2,11,"east"],
    [3,5,"west"], [3,6,"east"],
    [4,0,"west"], [4,11,"east"],
    [5,8,"north"],
    [6,3,"south"], 
    [7,0,"west"], [7,11,"east"],
    [8,5,"west"], [8,6,"east"],
    [9,0,"west"], [9,8,"north"], [9,11,"east"],
    [11,2,"south"], [11,4,"south"], [11,7,"south"], [11,9,"south"]
  ],
  getWallImg: function(wall) {
    return walls[wall[2]]
  }
}

// var lasers = {
//   head: "laserHead.png",
//   map: [
//   //h means horizontal laser, v means vertical laser
//   // first num: constant coordinate(x if horizontal, y if vertical)
//   //second num: from
//   //third num: to
//   ["h", 3, 5, 6]
// }

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
  // drawLasers();
}

function buildTiles() {
  for (var col = 0; col < tiles.cols; col ++){
    for (var row = 0; row < tiles.rows; row ++){
      var tileUrl = tiles.getTileImg(col, row);
                                                          //150x150 is the actual image size
      var tile = new PIXI.extras.TilingSprite.fromImage(tileUrl, 150, 150)
      
      //rescales the 150px tile image by 4 to fit a 480x640screen
      tile.position.x = 37.5*col
      tile.position.y = 37.5*row;
      tile.scale.set(.25,.25);

      stage.addChild(tile)
    }
  }
}

function buildWalls() {
  for(var i = 0; i < walls.map.length; i++) {
    //walls.map[0] is the row 
    //walls.map[1] is the col
    //walls.map[2] is the wall position n, e, s, w
    var wallImg = walls.getWallImg(walls.map[i])
    var wall = new PIXI.Sprite(PIXI.Texture.fromImage(wallImg))

    console.log(wall)
    wall.position.x = 37.5*walls.map[i][1];
    wall.position.y = 37.5*walls.map[i][0];
    wall.scale.set(.25,.25);
  
    // //west wall
    // wall.rotation = Math.PI/2
    // wall.position.x = wall.position.x + 5

    //south wall
    // wall.rotation = Math.PI
    // wall.position.y = wall.position.y - 5

    //east wall
    // wall.rotation = Math.PI/2
    // wall.position.x = wall.position.x + 37.5


    stage.addChild(wall);
  }
}

// function drawLasers() {
//   for(var i = 0; i < lasers.map.length; i++) {
//     if(lasers.map[i][0] === 'h')
//     var line = new PIXI.Graphics
//     line.lineStyle(2, 0xff0000)
//     line.moveTo(5*37.5, 3.5*37.5)
//     line.lineTo(7*37.5, 3.5*37.5)
//     stage.addChild(line)
//   }
// }
function init(){
  renderer.render(stage);
}


buildMap();
