// Deprecated!

import Motion from './motion/Motion.js';
import Communicator from './communicator/Communicator.js';

var drivers = [
	{MOTION: ''}
];

export default class {
	static get MOTION() { return 0; }
	static get COMMUNICATOR() { return 1; }
	
	static function getDriver(var driverId) {
		switch (driverId) {
			case MOTION:
				return Motion.getInstance();
				break;
		}
	}
}