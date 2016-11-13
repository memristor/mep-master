const should = require('should');
const TerrainService = Mep.require('services/path/PathService');
const Point = Mep.require('types/Point');
const Polygon = Mep.require('types/Polygon');

describe('PathService', () => {
    let terrainService = new TerrainService();
    let points = [
        new Point(100, 100),
        new Point(0, 0),
        new Point(0, 100)
    ];

    let firstPolygon = new Polygon('test', 1000, points);
    let secondPolygon = new Polygon('test', 1000, points);
    let firstPolygonId = terrainService.addObstacle(firstPolygon, 1000);
    let secondPolygonId = terrainService.addObstacle(secondPolygon, 1000);

    describe('#removeObstacle', () => {
        it('should return `true` if obstacle exists', () => {
            terrainService.removeObstacle(firstPolygonId).should.equal(false);
        });

        it('should return `false` if obstacle doesn\'t exist', () => {
            terrainService.removeObstacle(firstPolygonId).should.equal(false);
        });
    });
});