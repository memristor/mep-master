var motion = null;

export default class Motion {	
	constructor() {
		
	}
	
	static function getInstance() {
		if (motion == null) {
			motion = new Motion();
		}
		return motion;
	}
	
	function softStop() {
		
	}
	
	function hardStop() {
		
	}
	
	function moveForward() {
		
	}
	
	function moveBackward() {
		
	}
	
	function rotateTo() {
		
	}
	
	function rotateFor() {
		
	}
}