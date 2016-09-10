global.Mep = require('./Mep');

const TAG = 'Bootstrap';

class Bootstrap {
	constructor() {
	    // Print status
	    Mep.Log.info(TAG, 'MEP (Memristor\'s Eurobot Platform) started!');
        Mep.Log.info(TAG, 'Active table:', Mep.Config.get('Table'));
        Mep.Log.info(TAG, 'Simulation activated:', Mep.Config.get('Simulation'));


        // Load strategy
        // TODO: Load strategy from CLI
        let schedulerPath = __dirname + '/../strategies/default/Scheduler.js';
        const Scheduler = require(schedulerPath);
        let scheduler = new Scheduler();
        scheduler.runTask(scheduler.findBestTask());
	}
}

new Bootstrap();
