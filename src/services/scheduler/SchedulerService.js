const Task = Mep.require('strategy/Task');

const TAG = 'SchedulerService';

class SchedulerService {
    init(config) {

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