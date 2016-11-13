class Terrain {
    constructor(terrainNode) {
        this.terrain = [];
        this.scaleFactorWidth = 0;
        this.scaleFactorHeight = 0;
        this.terrainNode = terrainNode;

        let simulationWidth = terrainNode.offsetWidth;
        let simulationHeight = terrainNode.offsetHeight;


        for (let i = 0; i < TERRAIN_WIDTH; i++) {
            this.terrain[i] = [];
            for (let j = 0; j < TERRAIN_HEIGHT; j++) {
                this.terrain[i][j] = 0;
            }
        }

        this.scaleFactorWidth = simulationWidth / TERRAIN_WIDTH;
        this.scaleFactorHeight = simulationHeight / TERRAIN_HEIGHT;
    }

    addRobot(robot) {
        robot.setVisualScale(this.scaleFactorWidth, this.scaleFactorHeight);
        this.terrainNode.appendChild(robot.getNode());
    }
}
