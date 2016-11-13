class Terrain {
    constructor(terrainNode) {
        let terrain = this;

        this.terrain = [];
        this.scaleFactorWidth = 0;
        this.scaleFactorHeight = 0;
        this.terrainNode = terrainNode;

        let simulationWidth = terrainNode.offsetWidth;
        let simulationHeight = terrainNode.offsetHeight;

        this.scaleFactorWidth = simulationWidth / TERRAIN_WIDTH;
        this.scaleFactorHeight = simulationHeight / TERRAIN_HEIGHT;

        this.cursorCoordinates = {};
        this.terrainNode.addEventListener('mousemove', (e) => {
            let x = e.clientX - terrain.terrainNode.offsetLeft;
            let y = e.clientY - terrain.terrainNode.offsetTop;

            terrain.cursorCoordinates = {
                x: x / terrain.scaleFactorWidth,
                y: y / terrain.scaleFactorHeight
            };
        });
    }

    getCursorPosition() {
        return this.cursorCoordinates;
    }

    addRobot(robot) {
        robot.setVisualScale(this.scaleFactorWidth, this.scaleFactorHeight);
        this.terrainNode.appendChild(robot.getNode());
    }
}
