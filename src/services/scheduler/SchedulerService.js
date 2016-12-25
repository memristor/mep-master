const Task = Mep.require('types/Task');

const TAG = 'SchedulerService';

class SchedulerService {
    constructor(config) {

    }

    recommendNextTask(tasks) {
        let maxWeightTask = null;

        for (let i = 0; i < tasks.length; i++) {
            if ((maxWeightTask === null ||
                tasks[i].getWeight() > maxWeightTask.getWeight()) &&
                tasks[i].getState() === Task.READY) {
                maxWeightTask = tasks[i];
            }
        }

        return maxWeightTask;
    }
}

module.exports = SchedulerService;