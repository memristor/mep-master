'use strict';
global.Mep = require('./Mep');

async function bootstrap() {
    // Print status
    Mep.Log.info('MEP (Memristor\'s Eurobot Platform) started!');
    Mep.Log.info('Active robot:', Mep.Config.get('robot'));
    Mep.Log.info('Active table:', Mep.Config.get('table'));
    Mep.Log.info('Use simulation:', Mep.Config.get('simulation'));
    Mep.Log.info('Scheduler terrain:', Mep.Config.get('scheduler'));

    // Initialize drivers & services
    await Mep.init();

    // Load strategy
    let Scheduler = require(Mep.Config.get('scheduler'));
    new Scheduler();
}

bootstrap();
