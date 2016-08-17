global.MepRequire = require('./MepRequire');

const Config = require('./config/Config');
const Robot = require('./Robot');

/**
 * Main class where execution starts
 */
class App {
	constructor() {
	    // Start  ServiceManager
        var robot = new Robot(Config);
        var Log = robot.getLogger('app');


        Log.debug('Start pathfinding');
        setTimeout(function() {
            var PF = require('pathfinding');
            var grid = new PF.Grid(2000, 3000);
            var finder = new PF.AStarFinder();
            var path = finder.findPath(0, 0, 1999, 2999, grid);
            Log.debug('finished');
        }, 0);
        Log.debug('End pathfinding');


        const Scheduler = require('../strategies/default/Scheduler');
        var scheduler = new Scheduler(robot);
        scheduler.runTask(scheduler.findBestTask());
	}
}

new App();