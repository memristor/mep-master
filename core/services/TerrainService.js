/* Combines data from multiple sensors to terrain state (position of objects on terrain) */

var Point = require('./../types/Point');

module.exports = class {
	constructor() {
		this.dinamicObjects = [];
		
		// Terrain
		this.staticObjects = {
			wall: {
				height: 40,
				points: [ new Point(0, 0), new Point(0, 10), new Point(10, 10) ]
			}
		};
	}
}