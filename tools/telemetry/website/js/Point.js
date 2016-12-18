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
                this.y = y / terrainConfig.scaleFactorWidth - terrainConfig.width / 2;
                this.x = terrainConfig.height / 2 - x / terrainConfig.scaleFactorHeight;
                break;

            case 90:
                this.x = y / terrainConfig.scaleFactorWidth - terrainConfig.width / 2;
                this.y = terrainConfig.height / 2 - x / terrainConfig.scaleFactorHeight;
                break;

            case 180:
                this.y = terrainConfig.width / 2 - y / terrainConfig.scaleFactorWidth;
                this.x = x / terrainConfig.scaleFactorHeight - terrainConfig.height / 2;
                break;

            case 270:
                this.x = terrainConfig.width / 2 - y / terrainConfig.scaleFactorWidth;
                this.y = x / terrainConfig.scaleFactorHeight - terrainConfig.height / 2;
                break;
        }
    }

    exportWindowCoordinates(terrainConfig) {
        return {
            x: terrainConfig.scaleFactorHeight * (terrainConfig.height / 2 - this.x),
            y: terrainConfig.scaleFactorWidth * (this.y + terrainConfig.width / 2)
        };
    }
}