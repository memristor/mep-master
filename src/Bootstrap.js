global.Mep = require('./Mep');
const TAG = 'Bootstrap';

class Bootstrap {
    constructor() {
        // Print status
        Mep.Log.info('MEP (Memristor\'s Eurobot Platform) started!');
        Mep.Log.info('Active robot:', Mep.Config.get('robot'));
        Mep.Log.info('Active table:', Mep.Config.get('table'));
        Mep.Log.info('Use simulation:', Mep.Config.get('simulation'));

        // Initialize DriverManager & services
        Mep.init();

        // Load strategy
        // TODO: Load strategy from CLI
        let schedulerPath = __dirname + '/../strategies/default/Scheduler.js';
        const Scheduler = require(schedulerPath);
        let scheduler = new Scheduler();
        scheduler.runTask(scheduler.findBestTask());
    }
}

new Bootstrap();
