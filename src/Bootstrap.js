global.Mep = require('./Mep');

const TAG = 'Bootstrap';

class Bootstrap {
    constructor() {
        // Print status
        Mep.Log.info('MEP (Memristor\'s Eurobot Platform) started!');
        Mep.Log.info('Active robot:', Mep.Config.get('robot'));
        Mep.Log.info('Active table:', Mep.Config.get('table'));
        Mep.Log.info('Use simulation:', Mep.Config.get('simulation'));
        Mep.Log.info('Scheduler terrain:', Mep.Config.get('scheduler'));

        // Initialize drivers & services
        Mep.init(() => {
            // Load strategy
            let Scheduler = null;
            try {
                Scheduler = require(Mep.Config.get('scheduler'));
            } catch (e) {
                let errorMessage = 'Scheduler at terrain ' + Mep.Config.get('scheduler') + ' cannot be found';
                Mep.Log.error(TAG, errorMessage);
                throw Error(errorMessage);
            }
            (new Scheduler());
        });
    }
}

new Bootstrap();
