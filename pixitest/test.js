var stage = new PIXI.Stage(0x66ff99);
var renderer = new PIXI.CanvasRenderer(800,800);

document.body.appendChild(renderer.view);

// requestAnimationFrame(animate);


var emptyFloor = PIXI.Texture.fromImage('empty.jpg');
var roller = PIXI.Texture.fromImage('roller-express-east.jpg');
var laser = PIXI.Texture.fromImage('laser-double-vertical.png');

var tile00 = new PIXI.extras.TilingSprite(emptyFloor);
var tile01 = new PIXI.extras.TilingSprite(roller);
var tile10 = new PIXI.extras.TilingSprite(emptyFloor);
var tile11 = new PIXI.extras.TilingSprite(emptyFloor);
var laser = new PIXI.Sprite(laser);

tile00.position.x = 0;
tile00.position.y = 0;
tile01.position.x = 150;
tile01.position.y = 0;
tile10.position.x = 0;
tile10.position.y = 150;
tile11.position.x = 150;
tile11.position.y = 150;
laser.position.x = 150;
laser.position.y = 150;

stage.addChild(tile00);
stage.addChild(tile01);
stage.addChild(tile10);
stage.addChild(tile11);
stage.addChild(laser);

function init(){
  renderer.render(stage);
}
renderer.render(stage);

function animate(){
  requestAnimationFrame(animate);
  // tile00.rotation += 0.1;
  renderer.render(stage);
}


var map = {
  cols: 4,
  rows: 4,
  tsize: 150,
  tiles: [
    1, 1, 1, 1,
    1, 2, 2, 1,
    3, 3, 3, 3,
    2, 1, 1, 1
  ],
  getTile: function(row, col){
    return this.tiles[row * this.rows + col];
  },
  // tileSize: 150
};

var images = ['empty.jpg', 'option.jpg', 'roller-express-east.jpg']


function drawMap(){
  for (var row = 0; row < map.rows; row ++){
    for( var col = 0; col < map.cols; row++){
      var tile = map.getTile(1,2);
      var x = col * map.tsize;
      var y = row * map.tsize;
      context.drawImage(
        )
    }
  }
}
