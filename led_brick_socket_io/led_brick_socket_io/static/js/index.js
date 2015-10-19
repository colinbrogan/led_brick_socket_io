var resolutionX = 29;
var resolutionY = 6;
var tileSize = 20;
var fps = 1;
var $grid = $('#scaling-grid-tetris');

var score = 0;

var platClass = "plat-shade";
var shapeClass = "shape-shade";
var platClearClass = "plat-remove";

var Shapes = [
  [ 
    "XXXX",
  ],
  [
    "XXX",
    "X  ",
  ],
  [
    "XXX",
    "  X",
  ],
  [
    "XXX",
    " X ",
  ],
  [
    "XX",
    "XX",
  ],
];

function buildScreen() {
    $grid.each(function() {
      for(var i = 0; i < resolutionX*resolutionY; i++) {
        var x = i % resolutionX;
        var y = Math.floor(i / resolutionX);
        var $tile = $('<div/>')
          .addClass("tile")
          .attr("id","x"+x+"-"+"y"+y)
          .css("width",tileSize+"px")
          .css("height",tileSize+"px");
        $(this).append($tile);
      }
    }).css("width",resolutionX*tileSize);
}

/************************************/
/*******    SHAPE OBJECT     ********/
/*******                     ********/

var Shape = {

  landed: false,
  currentShapeIndex: 0,
  tiles: [

  ],
  generateAnew: function() {
    // Reset landed to false when creating new shape
    this.landed = false;

    // clear previous shape coordinates
    this.tiles = [];
    var randomIndex = Math.floor(Math.random()*Shapes.length);


    this.currentShapeIndex = randomIndex;
    var newShape = Shapes[randomIndex];

    // some number between 0 and resolutionY-newShape.length
    var randomYOffset = Math.round(Math.random()*(resolutionY-newShape.length));

    // Convert Shape Strings into x,y coordinates for this.tiles
    for(var rowIndex = 0; rowIndex < newShape.length; rowIndex++) {
      var row = newShape[rowIndex];
      for(var columnIndex = 0; columnIndex < row.length; columnIndex++) {
        if(row.charAt(columnIndex) == "X") {
          var zeroBaseX = columnIndex;
          var zeroBaseY = rowIndex;
          var offScreenX = zeroBaseX + resolutionX + 1;
          var randomStartY = zeroBaseY + randomYOffset;
          this.tiles.push([offScreenX,randomStartY]);
        }
      }
    }

  },
  moveLeft: function() {
    if(Platform.getsLandedOnBy(this.tiles)) {
      this.landed = true;
      return false;
    } else {
      var tempStoreTiles = this.tiles.splice(0);
      this.tiles = [];
      for(tile in tempStoreTiles) {
        var tileX = tempStoreTiles[tile][0];
        var tileY = tempStoreTiles[tile][1];
        Shape.tiles.push([tileX - 1,tileY]);
      }
      return true;
    }

  },
  moveUp: function() {
    console.log("Shape.moveDown()");
    var current_shape = Shapes[this.currentShapeIndex];
    if(Platform.pushedFromAboveBy(this.tiles)) {
      return false;
    } else {
      var tempStoreTiles = this.tiles.splice(0);
      this.tiles = [];
      for(tile in tempStoreTiles) {
        var tileX = tempStoreTiles[tile][0];
        var tileY = tempStoreTiles[tile][1];
        Shape.tiles.push([tileX,tileY - 1]);
      }
      return true;
    }
  },
  moveDown: function() {
    console.log("Shape.moveUp()");
    var current_shape = Shapes[this.currentShapeIndex];
    if(Platform.pushedUnderneathBy(this.tiles)) {
      return false;
    } else {
      var tempStoreTiles = this.tiles.splice(0);
      this.tiles = [];
      for(tile in tempStoreTiles) {
        var tileX = tempStoreTiles[tile][0];
        var tileY = tempStoreTiles[tile][1];
        Shape.tiles.push([tileX,tileY + 1]);
      }
      return true;
    }
  },
  turn: function(direction) {
    var tempTiles = this.tiles;
    // Do some things to 
    var lowestX = 999999999999;
    var lowestY = 999999999999;
    var highestX = 0;
    var highestY = 0;
    for(var tI in tempTiles) {
      var tileX = tempTiles[tI][0];
      var tileY = tempTiles[tI][1];
      if(tileY < lowestY) {
        lowestY = tileY;
      }
      if(tileX < lowestX) {
        lowestX = tileX;
      }
      if(tileX > highestX) {
        highestX = tileX;
      }
      if(tileY > highestY) {
        highestY = tileY;
      }
    }
    var rotationAxis = [lowestX,lowestY];
    var rotationAxisOffsetY = Math.round((highestY - lowestY) / 2);
    var newTiles = [];
    for(var tI in tempTiles) {
      var tileX = tempTiles[tI][0];
      var tileY = tempTiles[tI][1];
      var xOffset = tileX - lowestX;
      var yOffset = tileY - lowestY;
      var newX = lowestX + yOffset;
      var newY = lowestY - xOffset;
      newY = newY + rotationAxisOffsetY;
      newTiles.push([newX,newY]);
    }
    if(Platform.intersectsWith(newTiles)) {
      return false;
    } else {
      this.tiles = newTiles;
      return true;
    }
  },
  writeShades: function() {
    // clear prior shape shades to prepare for new shading
    removeShades("shape-shade");
    for(tile in this.tiles) {
      var tileX = this.tiles[tile][0];
      var tileY = this.tiles[tile][1];
      writeShade(tileX,tileY,"shape-shade");
    }
  }
}

var Platform = {
  // instance variables
  tiles: [
  ],
  removeTiles: [
  ],
  // instance methods
  freezeShape: function(shapeInstance) {
    console.log("Platform.freezeShape");
    for(var stI in shapeInstance.tiles) {
      var shapeTileX = shapeInstance.tiles[stI][0];
      var shapeTileY = shapeInstance.tiles[stI][1];
      this.tiles.push([shapeTileX,shapeTileY]);
    }
  },
  isOverflowing: function() {
    for(var ptI in this.tiles) {
      var platTileX = this.tiles[ptI][0];
      var platTileY = this.tiles[ptI][1];
      if(platTileX == resolutionX) {
        return true;
      }
    }
    return false;
  },
  clearColumns: function() {
    var tempStoreRemoveTiles = this.removeTiles.splice(0);
    console.log("tempStoreRemoveTiles");
    console.log(tempStoreRemoveTiles);
    this.removeTiles = [];
    var columns = {};
    for(var rtI in tempStoreRemoveTiles) {
      var removeTileX = tempStoreRemoveTiles[rtI][0];
      var removeTileY = tempStoreRemoveTiles[rtI][1];
      columns[removeTileX] = "shift-everything-after-this-column";
      for(var tI in this.tiles) {
        if(this.tiles[tI][0] == tempStoreRemoveTiles[rtI][0] && this.tiles[tI][1] == tempStoreRemoveTiles[rtI][1]) {
          this.tiles.splice(tI,1);
        }
      }
    }
    for(var x in columns) {
      console.log("shifting back for column "+x);
      score++;
      for(var tI in this.tiles) {
        var tileX = this.tiles[tI][0];
        var tileY = this.tiles[tI][1];
        if(tileX >= x) {
          this.tiles[tI][0] = this.tiles[tI][0] - 1;
        }
      }
    }
    this.writeShades();
  },
  checkFullColumn: function() {
    var candidates = {};
    for(var tileIndex in this.tiles) {
      var tileX = this.tiles[tileIndex][0];
      var tileY = this.tiles[tileIndex][1];
      if(candidates[tileX] == undefined) {
        candidates[tileX] = 1;
      } else {
        candidates[tileX] += 1;
      }
      if(candidates[tileX] == resolutionY) {
        console.log("Clear column "+tileX);
        var platformThis = this;
        var tagColumnForClearing = function(x) {
          for(var y = 0; y <= resolutionY; y++) {
            platformThis.removeTiles.push([x,y]);
          }
        }
        tagColumnForClearing(tileX);

      }
    }
  },
  intersectsWith: function(shapeTiles) {
    for(var stI in shapeTiles) {
      var shapeTileX = shapeTiles[stI][0];
      var shapeTileY = shapeTiles[stI][1];
      if(shapeTileX == 0) {
        return true;
      }
      if(shapeTileY<0 || shapeTileY > resolutionY ) {
        return true;
      }
      for(var ptI in this.tiles) {
        var platTileX = this.tiles[ptI][0];
        var platTileY = this.tiles[ptI][1];
        if(shapeTileX == platTileX && shapeTileY == platTileY) {
          return true;
        }
      }
    }
    return false;
  },
  getsLandedOnBy: function(shapeTiles) {
    for(var stI in shapeTiles) {
      var shapeTileX = shapeTiles[stI][0];
      var shapeTileY = shapeTiles[stI][1];
      if(shapeTileX == 0) {
        return true;
      }
      for(var ptI in this.tiles) {
        var platTileX = this.tiles[ptI][0];
        var platTileY = this.tiles[ptI][1];
        if(shapeTileX - platTileX <= 1 && shapeTileY == platTileY) {
          return true;
        }
      }
    }
    return false;
  },
  pushedUnderneathBy: function(shapeTiles) {
    for(var stI in shapeTiles) {
      var shapeTileX = shapeTiles[stI][0];
      var shapeTileY = shapeTiles[stI][1];
      if(shapeTileY == resolutionY -1) {
        return true;
      }

      for(var ptI in this.tiles) {
        var platTileX = this.tiles[ptI][0];
        var platTileY = this.tiles[ptI][1];
        if(shapeTileX == platTileX && platTileY - shapeTileY == 1) {
          return true;
        }
      }
    }
    return false;
  },
  pushedFromAboveBy: function(shapeTiles) {
    for(var stI in shapeTiles) {
      var shapeTileX = shapeTiles[stI][0];
      var shapeTileY = shapeTiles[stI][1];
      if(shapeTileY == 0) {
        return true;
      }
      for(var ptI in this.tiles) {
        var platTileX = this.tiles[ptI][0];
        var platTileY = this.tiles[ptI][1];
        if(shapeTileX == platTileX && shapeTileY - platTileY == 1) {
          return true;
        }
      }
    }
    return false;
  },
  gameOver: function() {
    this.tiles = [];
    this.removeTiles = [];
    for(var x = 1; x < resolutionX; x++) {
      for(var y = 1; y < resolutionY; y++) {
        this.removeTiles.push([x,y]);
      }
    }
    score = 0;
  },
  writeShades: function() {
    $grid.find(".tile").removeClass("plat-shade");
    removeShades("plat-shade");
    for(tile in this.tiles) {
      var tileX = this.tiles[tile][0];
      var tileY = this.tiles[tile][1];
      $(makeCoordinates(tileX,tileY)).addClass("plat-shade");
      writeShade(tileX,tileY,"plat-shade");
    }

    $grid.find(".tile").removeClass("plat-remove");
    removeShades("plat-remove");
    for(tile in this.removeTiles) {
      var tileX = this.removeTiles[tile][0];
      var tileY = this.removeTiles[tile][1];
      $(makeCoordinates(tileX,tileY)).addClass("plat-remove");
      writeShade(tileX,tileY,"plat-remove");
    }
  },
}
var firedOnce = false;

var fnum = 0;
var frameEvent = function() {
  socket.emit('fbegin',fnum);
  if(Platform.isOverflowing()) {
    Platform.gameOver();
    alert("Game Over! Your score is "+score);
  }
  if(Platform.removeTiles.length > 1) {
    Platform.clearColumns();
  }
  if(Shape.moveLeft()) {
    Shape.writeShades();
  } else {
    Platform.freezeShape(Shape);
    Platform.checkFullColumn();
    Shape.generateAnew();
  }
  Platform.writeShades();
  socket.emit('fend',fnum);
  fnum += 1;
}

var socket = io.connect("/led_brick");

$(document).ready(function() {
  buildScreen();
  Shape.generateAnew();
  frameEvent();
  setInterval(frameEvent, 1000/fps);
  $(window).unbind("keydown");
  $(window).on("keydown",function(event) { 
    if(event.keyCode == 37) {
      left();
    } else if (event.keyCode == 38) {
      up();
    } else if (event.keyCode == 39) {
      right();
    } else if (event.keyCode == 40) {
      down();
    }
  });
  $("#up").click(function(event) {
    up();
  });
  $("#left").click(function(event) {
    left();
  });
  $("#right").click(function(event) {
    right();
  });
  $("#down").click(function(event) {
    down();
  });
});

function left() {
  frameEvent();
}

function up() {
  socket.emit('fbegin',fnum);
  Shape.moveUp();
  Shape.writeShades();
  Platform.writeShades();
  socket.emit('fend',fnum);
  fnum+=1;
}

function right() {
  socket.emit('fbegin',fnum);
  Shape.turn();
  Shape.writeShades();
  Platform.writeShades();
  socket.emit('fend',fnum);
}

function down() {
  socket.emit('fbegin',fnum);
  Shape.moveDown();
  Shape.writeShades();
  Platform.writeShades();
  socket.emit('fend',fnum);
}

// utility

function writeShade(x,y,tileClass) {
  $(makeCoordinates(x,y)).addClass(tileClass);
  var color = "#000000";
  if(tileClass == "shape-shade") {
    color = "#FF0000";
  } else if(tileClass == "plat-shade") {
    color = "#0000FF";
  } else if(tileClass == "plat-remove") {
    color = "#00FF00";
  }
  socket.emit('wpixel',{x:x, y:y, color:color});
}

function removeShades(tileClass) {
  $grid.find(".tile").each(function(index) {
    if($(this).hasClass(tileClass)) {
      $(this).removeClass(tileClass);
      var id = $(this).attr("id");
      var coordinates = deriveCoordinates(id);
      socket.emit('wpixel',{ x:coordinates['x'], y:coordinates['y'], color:"#000000" });
    }
  });
}

function makeCoordinates(x,y) {
  return "#x"+x+"-y"+y;
}

function deriveCoordinates(id) {
  var x = id.split("-")[0];
  x = x.slice(2);
  var y = id.split("-")[1];
  y = y.slice(1);
  return {
    x: x,
    y: y,
  }
}