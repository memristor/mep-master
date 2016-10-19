const Path = require('path');
const NConf = require('nconf');
const Yargs = require('yargs');

const CONFIG_DIR = Path.join(__dirname, '/config');

// Set config parameters from CLI
NConf.argv({
    's': {
        alias: 'simulation',
        describe: 'Use simulation',
        type: 'bool',
        default: false
    },
    't': {
        alias: 'table',
        describe: 'Table name',
        type: 'string',
        default: 'default'
    },
    'r': {
        alias: 'robot',
        describe: 'Robot name',
        type: 'string',
        default: 'big'
    },
    'p': {
        alias: 'performance',
        describe: 'Turn off debug messages',
        type: 'bool',
        default: false
    },
    'c': {
        alias: 'scheduler',
        describe: 'Path to strategy\'s scheduler',
        type: 'path',
        default: Path.join(__dirname, '/../strategies/default/Scheduler.js')
    }
});


// Set general CLI options
let yargs = Yargs
    .usage('Usage: ./mep [options]')
    .example('./mep -p -r=small -t=green_table_1', 'Use small robot on green table and turn off log messages')
    .help('h')
    .alias('h', 'help')
    .epilog('Copyright @2016 Memristor')
    .argv;


// Choose the top level config file
let simulationSuffix = NConf.get('simulation') ? 'simulation' : '';
NConf.file(CONFIG_DIR + '/' + NConf.get('robot') + '.' + simulationSuffix + '.json');


// Fill the rest of the configuration with default values
NConf.add('test', {
    type: 'file',
    file: CONFIG_DIR + '/default.json'
});

module.exports = NConf;
