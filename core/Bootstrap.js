global.Mep = require('./Mep');

class Bootstrap {
	constructor() {
        let schedulerPath = __dirname + '/../strategies/default/Scheduler.js';

        const Scheduler = require(schedulerPath);
        let scheduler = new Scheduler();
        scheduler.runTask(scheduler.findBestTask());
	}
}

new Bootstrap();
