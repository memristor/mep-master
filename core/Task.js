const Log = require('./Log');

const TAG = 'Task';


class Task {
    static get READY() { return 1; }
    static get SUSPENDED() { return 2; }
    static get ACTIVE() { return 3; }

    constructor() {
        this.state = Task.READY;
    }

    run() {
        this.state = Task.ACTIVE;
        this.onRun();
    }

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
