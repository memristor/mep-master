const nconf = require('nconf');
const yargs = require('yargs');

const CONFIG_DIR =  __dirname + '/config';

// Set config parameters from CLI
nconf.argv({
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
    }
});


// Set general CLI options
let argv = yargs
    .usage('Usage: ./mep [options]')
    .example('./mep -p -r=small -t=green_table_1', 'Use small robot on green table and turn off log messages')
    .help('h')
    .alias('h', 'help')
    .epilog('Copyright @2016 Memristor')
    .argv;


// Choose the top level config file
let simulationSuffix = nconf.get('simulation') ? 'simulation' : '';
nconf.file(CONFIG_DIR + '/' + nconf.get('robot') + '.' + simulationSuffix + '.json');


// Fill the rest of the configuration with default values
nconf.add('test', { type: 'file', file: CONFIG_DIR + '/default.json'});

module.exports = nconf;