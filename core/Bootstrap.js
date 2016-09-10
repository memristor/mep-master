global.Mep = require('./Mep');

const TAG = 'Bootstrap';

class Bootstrap {
	constructor() {
	    Mep.Log.debug(TAG, 'Initialization started');

        let schedulerPath = __dirname + '/../strategies/default/Scheduler.js';

        const Scheduler = require(schedulerPath);
        let scheduler = new Scheduler();
        scheduler.runTask(scheduler.findBestTask());
	}
}

new Bootstrap();
