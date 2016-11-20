class Terrain {
    constructor(terrainConfig, terrainNode) {
        let terrain = this;

        // Store arguments
        this.terrainNode = terrainNode;
        this.terrainConfig = terrainConfig;

        // Define locals
        this.terrainConfig.scaleFactorWidth = terrainNode.offsetWidth / terrainConfig.width;
        this.terrainConfig.scaleFactorHeight = terrainNode.offsetHeight / terrainConfig.height;

        this.cursorCoordinates = new Point(0, 0);

        this.terrainNode.addEventListener('mousemove', (e) => {
            terrain.cursorCoordinates.importWindowCoordinates(
                terrain.terrainConfig,
                e.clientX - terrain.terrainNode.offsetLeft,
                e.clientY - terrain.terrainNode.offsetTop
            );
        });
    }

    getCursorPosition() {
        return this.cursorCoordinates;
    }

    addRobot(robot) {
        this.terrainNode.appendChild(robot.getNode());
    }
}
