const Bunyan = require('bunyan');
const ServiceManager = require('./services/ServiceManager');
const DriverManager = require('./drivers/DriverManager');

var loggers = {};

class Robot {
    constructor(config) {
        this.config = config;
        this.serviceManager = new ServiceManager();
        this.driverManager = new DriverManager();
    }

    getService(name) {
        return this.serviceManager.getService(name);
    }

    getDriver(name) {
        return this.driverManager.getDriver(name);
    }

    getConfig() {
        return this.config;
    }

    getLogger(name) {
        if (name in loggers) {
            return loggers[name];
        }

        // Else make new logger
        var logger = Bunyan.createLogger({
            name: name,
            src: true,
        });
        loggers[name] = logger;
        return logger;
    }
}

module.exports = Robot;
