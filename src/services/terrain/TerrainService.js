var Point = Mep.require('types/Point');

class TerrainService {
	constructor() {
		this.dinamicObjects = [];

		// Terrain
		this.staticObjects = {
			wall: {
				height: 40,
				points: [new Point(0, 0), new Point(0, 10), new Point(10, 10)]
			}
		};
	}

	addObstacle(name, duration, points) {

    }

    removeObstacle(name) {

    }
}

module.exports = TerrainService;