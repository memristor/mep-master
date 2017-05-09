const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');

const TAG = 'SampleTask';

class SampleTask extends Task {
    async onRun() {

    }
}

module.exports = SampleTask;