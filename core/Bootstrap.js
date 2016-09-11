global.Mep = require('./Mep');

const TAG = 'Bootstrap';

class Bootstrap {
	constructor() {
	    // Print status
	    Mep.Log.info('MEP (Memristor\'s Eurobot Platform) started!');
        Mep.Log.info('Active table:', Mep.Config.get('Table'));
        Mep.Log.info('Simulation activated:', Mep.Config.get('Simulation'));


        // Load strategy
        // TODO: Load strategy from CLI
        let schedulerPath = __dirname + '/../strategies/default/Scheduler.js';
        const Scheduler = require(schedulerPath);
        let scheduler = new Scheduler();
        scheduler.runTask(scheduler.findBestTask());
	}
}

new Bootstrap();
