var stage = new PIXI.Stage(0x66ff99);
var renderer = new PIXI.CanvasRenderer(1800,1800);

document.body.appendChild(renderer.view);

var tileImg = {"0": {"image":"repair.jpg"},
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
"14": {"image":"wall-east.png"},
"15": {"image":"wall-west.png"},
"16": {"image":"wall-north.png"},
"17": {"image":"wall-south.png"}
};

var map = {
  cols: 12,
  rows: 12,
  tiles: [
    2,2,2,2,2,2,2,2,2,2,2,0,
    2,8,11,11,11,11,11,11,11,11,6,2,
    2,10,12,2,12,2,13,2,13,2,5,2,
    2,10,2,3,2,12,2,13,2,13,5,2,
    2,10,12,2,12,2,3,2,13,2,5,2,
    2,10,2,12,2,1,2,13,2,13,5,2,
    2,10,12,2,12,2,1,2,3,2,5,2,
    2,10,2,12,2,3,2,13,2,13,5,2,
    2,10,12,2,12,2,13,2,13,2,5,2,
    2,10,2,12,2,12,2,13,2,13,5,2,
    2,4,9,9,9,9,9,9,9,9,7,2,
    0,2,2,2,2,2,2,2,2,2,2,2
  ],
  getTile: function(col, row){
    var tileId = this.tiles[row * this.rows + col].toString();
    var tileSrc = tileImg[tileId].image;
    return tileSrc;
  }
};

function buildMap(){
  for (var col = 0; col < map.cols; col ++){
    for (var row = 0; row < map.rows; row ++){
      var tileUrl = map.getTile(col, row);
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
buildMap();

function init(){
  renderer.render(stage);
}
