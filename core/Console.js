const CLI = require('cli');

// TODO: Implement NODE_APP_INSTANCE={robot_name} to load different configuration file
class Console {
    static processParams(args, options) {
        //console.log(options);
    }

    static applyParams(config) {

    }
}

CLI.parse({
    robot: [ 'r', 'Choose which robot `small` or `big`', 'string', 'big' ],
    strategy: ['s', 'Path to Scheduler of strategy', 'path']
});

CLI.main(function (args, options) {
    Console.processParams(args, options);
});