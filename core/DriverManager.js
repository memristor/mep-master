const Config = require('./Config');

var MotionDriver;
var ModbusDriver;

if (Config.get('Simulation') == true) {
    MotionDriver = require('./drivers/motion/MotionDriverSimulator');
    ModbusDriver = require('./drivers/modbus/ModbusDriverSimulator');
} else {
    MotionDriver = require('./drivers/motion/MotionDriver');
    ModbusDriver = require('./drivers/modbus/ModbusDriver');
}

var instance = null;

/**
 * Manage services. Start all services and provides instance of required service.
 * Singleton class.
 */
class DriverManager {
    static get MOTION_DRIVER() { return 'MOTION_DRIVER'; }
    static get MODBUS_DRIVER() { return 'MODBUS_DRIVER'; }

    constructor() {
        this.motionDriver = new MotionDriver(0, 0);
        this.modbusDriver = new ModbusDriver();
    }

    static get() {
        if (instance == null) {
            instance = new DriverManager();
        }
        return instance;
    }

    /**
     * Get service instance by service name
     *
     * @param name {String} - Service name. Eg. `SCHEDULER`
     * @returns {Object} - Required service
     */
    getDriver(name) {
        switch (name) {
            case DriverManager.MOTION_DRIVER:
                return this.motionDriver;
                break;

            case DriverManager.MODBUS_DRIVER:
                return this.modbusDriver;
                break;

            default:
                console.log('error gettting driver');
                break;
        }
    }
}

module.exports = DriverManager;
