const Log = require('../../Log');
const Serial = require('../../communication/Serial');

var motion = null;
const TAG = 'Motion';

module.exports = class Motion {
	constructor() { }

	
	static getInstance() {
		if (motion == null) {
			motion = new Motion();
		}
		return motion;
	}
	
	softStop() {
		
	}
	
	hardStop() {
		
	}
	
	moveForward() {
		
	}
	
	moveBackward() {
		
	}
	
	rotateTo() {
		
	}
	
	rotateFor() {
		
	}
}