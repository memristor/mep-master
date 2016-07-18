// You are able to require relative to root
// USAGE: `const Class = require(__core + 'Class');`
global.__core = __dirname + '/';

const Log = require('./Log');
const Config = require('./Config');
const ServiceManager = require('./services/ServiceManager');

const TAG = 'App';

/**
 * Main class where execution starts
 */
class App {
	constructor() {
	    // Start  ServiceManager
        ServiceManager.getInstance();


        Log.debug(TAG, 'Start pathfinding', 2);
        setTimeout(function() {
            var PF = require('pathfinding');
            var grid = new PF.Grid(2000, 3000);
            var finder = new PF.AStarFinder();
            var path = finder.findPath(0, 0, 1999, 2999, grid);
            Log.debug(TAG, 'finished', 2);
        }, 0);
        Log.debug(TAG, 'End pathfinding', 2);


        const Scheduler = require('../strategies/default/Scheduler');
        var scheduler = new Scheduler();
        scheduler.runTask(scheduler.findBestTask());

        for (let i = 2; i < process.argv.length; i++) {
            console.log(process.argv[i]);
        }
	}
}

new App();