function Terrain(terrainNode) {
    this.terrain = [];
    this.scaleFactorWidth = 0;
    this.scaleFactorHeight = 0;
    this.terrainNode = terrainNode;

    var simulationWidth = terrainNode.offsetWidth;
    var simulationHeight = terrainNode.offsetHeight;


    for (var i = 0; i < TERRAIN_WIDTH; i++) {
        this.terrain[i] = [];
        for (var j = 0; j < TERRAIN_HEIGHT; j++) {
            this.terrain[i][j] = 0;
        }
    }

    this.scaleFactorWidth = simulationWidth / TERRAIN_WIDTH;
    this.scaleFactorHeight = simulationHeight / TERRAIN_HEIGHT;
}

Terrain.prototype.addRobot = function(robot) {
    robot.setVisualScale(this.scaleFactorWidth, this.scaleFactorHeight);
    this.terrainNode.appendChild(robot.getNode());
}
