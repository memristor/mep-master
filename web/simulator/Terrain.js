const TERRAIN_WIDTH = 2000;
const TERRAIN_HEIGHT = 3000;

function Terrain(simulationWidth, simulationHeight) {
    this.terrain = [];
    this.scaleFactorWidth = 0;
    this.scaleFactorHeight = 0;


    for (var i = 0; i < TERRAIN_WIDTH; i++) {
        for (var j = 0; j < TERRAIN_HEIGHT; j++) {
            this.terrain[i][j] = 0;
        }
    }

    this.scaleFactorWidth = simulationWidth / TERRAIN_WIDTH;
    this.scaleFactorHeight = simulationHeight / TERRAIN_HEIGHT;
}

Terrain.prototype.addRect = function(center, width, height) {

}