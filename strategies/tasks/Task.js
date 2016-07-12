const Log = require('../../core/Log');

const TAG = 'Task';

class Task {
	onRun() {
		Log.warn(TAG, 'Override onRun() please.', 2);
	}
	
	onEnemyDetected(status) {
		// Default action on enemy detected
	}
	
	onStacked(status) {
		//status.action = '';
		// Default action on stacked
	}
}

module.exports = Task;