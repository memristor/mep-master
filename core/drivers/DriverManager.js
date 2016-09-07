const Config = require('../config/default');
const MotionDriver = require('./motion/MotionDriver');
const ModbusDriver = require('./modbus/ModbusDriver');

/**
 * Manage services. Start all services and provides instance of required service.
 * Singleton class.
 */
class DriverManager {
    static get MOTION_DRIVER() { return 'MOTION_DRIVER'; }
    static get MODBUS_DRIVER() { return 'MODBUS_DRIVER'; }

    constructor(robot) {
        this.robot = robot;

        this.motionDriver = new MotionDriver(0, 0);
        console.log('test');
        this.modbusDriver = new ModbusDriver();
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
