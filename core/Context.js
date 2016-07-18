const Config = require('./Config');
const ServiceManager = require('./services/ServiceManager');
const DriverManager = require('./drivers/DriverManager');

class Context {
    getService(name) {
        return ServiceManager.getInstance().getService(name);
    }

    getDriver(name) {
        return DriverManager.getInstance().getDriver(name);
    }

    getConfig() {
        return Config;
    }
}