const Path = require('path');
const NConf = require('nconf');
const Yargs = require('yargs');
const CONFIG_DIR = Path.join(__dirname, '../config');

// We have chosen yaml over json because it supports hexadecimal numbers
NConf.formats.yaml = require('nconf-yaml');
NConf.use('memory');

// Choose the top level config file
if (process.env.MEP_TEST) {
    NConf.add('general', {
        format: NConf.formats.yaml,
        type: 'file',
        file: CONFIG_DIR + '/test.yaml'
    });

    NConf.load();

} else {
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
            default: '../strategies/default/DefaultScheduler.js'
        },
        'v': {
            alias: 'server',
            describe: 'MEP Server IP and port, eg. 127.0.0.1:1117',
            type: 'string',
            default: ''
        },
        'i': {
            // obsolete, see Udp.js for multicast example
            alias: 'friendIp',
            describe: 'IP of friend robot to enable communication',
            type: 'string',
            default: '192.168.12.1'
        }
    });

    // Set general CLI options
    let yargs = Yargs
        .usage('Usage: ./mep [options]')
        .example('./mep -t yellow -c ../strategies/small/DefaultScheduler.js -r small', 'Use small robot on green table and turn off log messages')
        .help('h')
        .alias('h', 'help')
        .epilog('Copyright @2016 Memristor')
        .argv;


    if (NConf.get('simulation') === true) {
        NConf.add('simulation', {
            format: NConf.formats.yaml,
            type: 'file',
            file: CONFIG_DIR + '/' + NConf.get('robot') + '.simulation.yaml'
        });
    }

    NConf.add('robot', {
        format: NConf.formats.yaml,
        type: 'file',
        file: CONFIG_DIR + '/' + NConf.get('robot') + '.yaml'
    });

    // Fill the rest of the configuration with default values
    NConf.add('general', {
        format: NConf.formats.yaml,
        type: 'file',
        file: CONFIG_DIR + '/default.yaml'
    });

    NConf.load();

}

module.exports = NConf;
