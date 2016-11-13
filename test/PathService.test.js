const should = require('should');
const TerrainService = Mep.require('services/path/PathService');
const Point = Mep.require('types/Point');
const Polygon = Mep.require('types/Polygon');

describe('PathService', () => {
    let pathService = new TerrainService();
    let points = [
        new Point(1, 1),
        new Point(100, 1),
        new Point(100, 100),
        new Point(1, 100)
    ];

    let firstPolygon = new Polygon('test', 1000, points);
    let secondPolygon = new Polygon('test', 1000, points);
    let firstPolygonId = pathService.addObstacle(firstPolygon, 1000);
    let secondPolygonId = pathService.addObstacle(secondPolygon, 1000);

    describe('#removeObstacle', () => {
        it('should return `true` if obstacle exists', () => {
            pathService.removeObstacle(firstPolygonId).should.equal(true);
        });

        it('should return `false` if obstacle doesn\'t exist', () => {
            pathService.removeObstacle(firstPolygonId).should.equal(false);
        });
    });

    describe('#search', () => {
        it('should return correct path', () => {
            let pathPoints = pathService.search(new Point(0, 0), new Point(101, 101));
            pathPoints[0].getX().should.equal(100);
            pathPoints[0].getY().should.equal(1);
        });
    });
});