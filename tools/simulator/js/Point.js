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
        switch (terrainConfig.terrainOrientation) {
            case 0:
                this.x = x / terrainConfig.scaleFactorWidth - terrainConfig.width / 2;
                this.y = terrainConfig.height / 2 - y / terrainConfig.scaleFactorHeight;
                break;

            case 90:
                this.y = x / terrainConfig.scaleFactorWidth - terrainConfig.width / 2;
                this.x = terrainConfig.height / 2 - y / terrainConfig.scaleFactorHeight;
                break;

            case 180:
                this.x = terrainConfig.width / 2 - x / terrainConfig.scaleFactorWidth;
                this.y = y / terrainConfig.scaleFactorHeight - terrainConfig.height / 2;
                break;

            case 270:
                this.y = terrainConfig.width / 2 - x / terrainConfig.scaleFactorWidth;
                this.x   = y / terrainConfig.scaleFactorHeight - terrainConfig.height / 2;
                break;
        }
    }

    exportWindowCoordinates(terrainConfig) {
        return {
            x: terrainConfig.scaleFactorWidth * (this.x + terrainConfig.width / 2),
            y: terrainConfig.scaleFactorHeight * (terrainConfig.height / 2 - this.y)
        };
    }
}