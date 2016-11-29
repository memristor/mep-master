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

                e.clientY - terrain.terrainNode.offsetTop,
                e.clientX - terrain.terrainNode.offsetLeft
            );
        });
    }

    rotate() {
        if (this.terrainConfig.terrainOrientation < 270) {
            this.terrainConfig.terrainOrientation += 90;
        } else {
            this.terrainConfig.terrainOrientation = 0;
        }
        this.terrainNode.style.transform = 'rotate(' + this.terrainConfig.terrainOrientation + 'deg)';
    }

    getCursorPosition() {
        return this.cursorCoordinates;
    }

    addRobot(robot) {
        this.terrainNode.appendChild(robot.getNode());
    }
}
