const TAG = 'Task';

class Task {
    static get READY() { return 1; }
    static get SUSPENDED() { return 2; }
    static get ACTIVE() { return 3; }
    static get FINISHED() { return 4; }

    constructor(weight, time, location) {
        this.state = Task.READY;
        this.weight = weight;
        this.time = time;
        this.location = location;
    }

    getLocation() { return this.location; }
    getWeight() { return this.weight; }
    getTime() { return this.time; }
    getState() { return this.state; }
    setWeight(weight) { this.weight = weight; }
    setState(state) { this.state = state; }

    run() {
        this.state = Task.ACTIVE;
        this.onRun();
    }

	onRun() {
		Mep.Log.warn(TAG, 'Override onRun() please.');
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
