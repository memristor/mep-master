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
        const Scheduler = require(Mep.Config.get('scheduler'));
        let scheduler = new Scheduler();
        scheduler.runTask(scheduler.findBestTask());
    }
}

new Bootstrap();
