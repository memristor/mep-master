const TerrainService = Mep.require('services/terrain/TerrainService');
const Point = Mep.require('misc/Point');
const Polygon = Mep.require('misc/Polygon');
const assert = require('assert');

describe('TerrainService', () => {
    let terrainService = new TerrainService();
    terrainService.init({ staticObstacles: [] });
    let points = [
        new Point(1, 1),
        new Point(100, 1),
        new Point(100, 100),
        new Point(1, 100)
    ];

    let firstPolygon = new Polygon('test', 1000, points);
    let secondPolygon = new Polygon('test', 1000, points);
    let firstPolygonId = terrainService.addObstacle(firstPolygon, 1000);
    let secondPolygonId = terrainService.addObstacle(secondPolygon, 1000);

    describe('#removeObstacle', () => {
        it('should return `true` if obstacle exists', () => {
            assert(terrainService.removeObstacle(firstPolygonId) === true);
        });

        it('should return `false` if obstacle doesn\'t exist', () => {
            assert(terrainService.removeObstacle(firstPolygonId) === false);
        });
    });

    describe('#findPath', () => {
        it('should return correct terrain', () => {
            let pathPoints = terrainService.findPath(new Point(0, 0), new Point(101, 101));
            assert(pathPoints[0].getX() === 100);
            assert(pathPoints[0].getY() === 1);
        });
    });
});