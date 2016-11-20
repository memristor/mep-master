class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    setX(x) { this.x = x; }
    setY(y) { this.y = y; }
    getX() { return this.x; }
    getY() { return this.y; }

    getDistance(point) {
        return Math.sqrt(
            Math.pow((point.getX() - this.x), 2) +
            Math.pow((point.getY() - this.y), 2)
        );
    }

    importWindowCoordinates(terrainConfig, x, y) {
        this.x = x / terrainConfig.scaleFactorWidth - terrainConfig.width / 2;
        this.y = terrainConfig.height / 2 - y / terrainConfig.scaleFactorHeight;
    }

    exportWindowCoordinates(terrainConfig) {
        return {
            x: terrainConfig.scaleFactorWidth * (this.x + terrainConfig.width / 2),
            y: terrainConfig.scaleFactorHeight * (terrainConfig.height / 2 - this.y)
        };
    }
}