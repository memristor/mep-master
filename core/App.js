// You are able to require relative to root
// USAGE: `const Class = require(__base + 'Class');`
global.__base = __dirname + '/';

const WorldState = require('./TerrainService');
const Log = require('./Log');
const Config = require('./Config');
const MotionDriver = require('./drivers/motion/MotionDriver');

const TAG = 'App';

/**
 * Main class where execution starts
 */
class App {
	constructor() {
		this.worldState = new WorldState();

        Log.debug(TAG, Config.DEBUG);
        Log.error(TAG, 'error');

        const readline = require('readline');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('What do you think of Node.js? ', (answer) => {
            // TODO: Log the answer in a database
            console.log('Thank you for your valuable feedback:', answer);

            rl.close();
        });


		// Init beacon, brkon, communicator, laser, lidar and motion
	}
}

new App();