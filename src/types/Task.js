const TAG = 'Task';

class Task {
    static get READY() {
        return 1;
    }

    static get SUSPENDED() {
        return 2;
    }

    static get ACTIVE() {
        return 3;
    }

    static get FINISHED() {
        return 4;
    }

    constructor(scheduler, weight, time, location) {
        this.state = Task.READY;
        this.weight = weight;
        this.time = time;
        this.location = location;
        this.scheduler = scheduler;
    }

    finish() {
        this.state = Task.FINISHED;
        this.scheduler.runNextTask();
    }

    suspend() {
        this.state = Task.SUSPENDED;
        this.scheduler.runNextTask();
    }

    getLocation() {
        return this.location;
    }

    getWeight() {
        return this.weight;
    }

    getTime() {
        return this.time;
    }

    getState() {
        return this.state;
    }

    setWeight(weight) {
        this.weight = weight;
    }

    setState(state) {
        this.state = state;
    }

    run() {
        this.state = Task.ACTIVE;
        this.onRun();
    }

    onRun() {
        Mep.Log.warn(TAG, 'Override onRun() please.');
    }
}

module.exports = Task;
