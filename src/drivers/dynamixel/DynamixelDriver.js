'use strict';

/** @namespace drivers.dynamixel */
const TaskError = Mep.require('strategy/TaskError');



const TAG = 'DynamixelDriver';

/**
 * Communicates with dynamixel servos (AX12 & RX24).
 * NOTE: This class doesn't send start bytes & checksum, please make custom `communicator`
 * (`@dependecies.communicator`) if you want these features.
 * @memberOf drivers.dynamixel
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class DynamixelDriver {
    static get AX_MODEL_NUMBER_L() { return 0; }
    static get AX_MODEL_NUMBER_H() { return 1; }
    static get AX_VERSION() { return 2; }
    static get AX_SERVO_ID() { return 3; }
    static get AX_BAUD_RATE() { return 4; }
    static get AX_RETURN_DELAY_TIME() { return 5; }
    static get AX_CW_ANGLE_LIMIT_L() { return 6; }
    static get AX_CW_ANGLE_LIMIT_H() { return 7; }
    static get AX_CCW_ANGLE_LIMIT_L() { return 8; }
    static get AX_CCW_ANGLE_LIMIT_H() { return 9; }
    static get AX_LIMIT_TEMPERATURE() { return 11; }
    static get AX_LOW_LIMIT_VOLTAGE() { return 12; }
    static get AX_HIGH_LIMIT_VOLTAGE() { return 13; }
    static get AX_MAX_TORQUE_L() { return 14; }
    static get AX_MAX_TORQUE_H() { return 15; }
    static get AX_RETURN_LEVEL() { return 16; }
    static get AX_ALARM_LED() { return 17; }
    static get AX_ALARM_SHUTDOWN() { return 18; }
    static get AX_DOWN_CALIBRATION_L() { return 20; }
    static get AX_DOWN_CALIBRATION_H() { return 21; }
    static get AX_UP_CALIBRATION_L() { return 22; }
    static get AX_UP_CALIBRATION_H() { return 23; }
    static get AX_TORQUE_ENABLE() { return 24; }
    static get AX_LED() { return 25; }
    static get AX_CW_COMPLIANCE_MARGIN() { return 26; }
    static get AX_CCW_COMPLIANCE_MARGIN() { return 27; }
    static get AX_CW_COMPLIANCE_SLOPE() { return 28; }
    static get AX_CCW_COMPLIANCE_SLOPE() { return 29; }
    static get AX_GOAL_POSITION_L() { return 30; }
    static get AX_GOAL_POSITION_H() { return 31; }
    static get AX_GOAL_SPEED_L() { return 32; }
    static get AX_GOAL_SPEED_H() { return 33; }
    static get AX_TORQUE_LIMIT_L() { return 34; }
    static get AX_TORQUE_LIMIT_H() { return 35; }
    static get AX_PRESENT_POSITION_L() { return 36; }
    static get AX_PRESENT_POSITION_H() { return 37; }
    static get AX_PRESENT_SPEED_L() { return 38; }
    static get AX_PRESENT_SPEED_H() { return 39; }
    static get AX_PRESENT_LOAD_L() { return 40; }
    static get AX_PRESENT_LOAD_H() { return 41; }
    static get AX_PRESENT_VOLTAGE() { return 42; }
    static get AX_PRESENT_TEMPERATURE() { return 43; }
    static get AX_REGISTERED_INSTRUCTION() { return 44; }
    static get AX_MOVING() { return 46; }
    static get AX_LOCK() { return 47; }
    static get AX_PUNCH_L() { return 48; }
    static get AX_PUNCH_H() { return 49; }

    static get AX_POLL_POSITION() { return 50; }        // Custom, Memristor's implementation

    constructor(name, config) {
        this.config = Object.assign({
            id: 0xFE,
            maxPosition: 1023,
            minPosition: 0
        }, config);
        this.name = name;

        if (this.config.cid === undefined) {
            throw Error(TAG, this.name, 'You must provide a communication ID');
        }

        this._onDataReceived = this._onDataReceived.bind(this);
        this.uniqueDataReceivedCallback = null;

        this._lastPosition = 0;

        this.communicator = null;
        if (this.config._communicator !== undefined) {
            // For testing purposes only (experiments)
            this.communicator = this.config._communicator;
        } else {
            this.communicator = Mep.DriverManager.getDriver(this.config['@dependencies'].communicator);
        }
        this.communicator.on('data_' + this.config.cid, this._onDataReceived);
    }

    _onDataReceived(data) {
        if (data.readUInt8(0) === (this.config.id | 0)) {

            // Length === 1 means there is an error in communication (UART, Servo <--> AVR)
            if (data.length === 2) {
                switch (data.readInt8(1)) {
                    case 0x03:
                        Mep.Log.error(TAG, this.name, 'RX Timeout error');
                        break;

                    case 0x02:
                        Mep.Log.error(TAG, this.name, 'RX Data corrupted');
                        break;

                    case 0x04:
                        Mep.Log.error(TAG, this.name, 'TX transfer failed');
                        break;

                    case 0x05:
                        Mep.Log.error(TAG, this.name, 'TX transfer timeout');
                        break;

                    default:
                        Mep.Log.error(TAG, this.name, 'Unhandled error', data);
                        break;
                }
                return;
            }

            if (this.uniqueDataReceivedCallback !== null) {
                this.uniqueDataReceivedCallback(data);
            }
        }
    }

    getTemperature() {
        return this._read(DynamixelDriver.AX_PRESENT_TEMPERATURE);
    }

    async getVoltage() {
        return await this._read(DynamixelDriver.AX_PRESENT_VOLTAGE);
    }

    getLoad() {
        return this._read(DynamixelDriver.AX_PRESENT_LOAD_L);
    }

    getTorqueLimit() {
        return this._read(DynamixelDriver.AX_TORQUE_LIMIT_L);
    }

    getFirmwareVersion() {
        return this._read(DynamixelDriver.AX_VERSION);
    }

    async getPosition() {
        return await this._read(DynamixelDriver.AX_PRESENT_POSITION_L, true);
    }

    getSpeed() {
        return this._read(DynamixelDriver.AX_PRESENT_SPEED_L, true);
    }

    /**
     * Set servo to required position and get promise when position is reached
     * @param position {Number} - Required position in degrees
     * @param {Object} [config] Configuration options.
     * @param {Number} [config.pollingPeriod] Polling period for servo's present position in ms
     * @param {Number} [config.tolerance] Tolerated error in degrees
     * @param {Number} [config.timeout] Maximal time servo to reach a position in ms
     * @param {Boolean} [config.firmwareImplementation] Should it use firmware (true) or software (false) implementation.
     * Firmware implementation is faster, however in that case we have to have a dedicated hardware (our actuator board supports it).
     */
    go(position, config) {
        let c = Object.assign({
            pollingPeriod: 300,
            tolerance: 35,
            timeout: 3000,
            firmwareImplementation: false
        }, config);

        let ax = this;
        let timeout = false;
        this.setPosition(position);

        return new Promise((resolve, reject) => {
            // Apply time out
            setTimeout(() => {
                timeout = true;
                reject(new TaskError(TAG + ':' + this.name, 'timeout', 'Dynamixel cannot reach position (' + position + ') in time'));
            }, c.timeout);

            if (c.firmwareImplementation === true) {
                // Firmware polling implementation
                throw Error('Firmware implementation is not implemented');
                this._writeWord(
                    DynamixelDriver.AX_POLL_POSITION,
                    ((c.tolerance << 8) | (c.pollingPeriod & 0xFF))
                );

            } else {
                // Software polling implementation
                let checkPosition = () => {
                    setTimeout(() => {
                        ax.getPosition().then((currentPosition) => {
                            if (Math.abs(currentPosition - position) <= c.tolerance) {
                                resolve();
                            } else {
                                if (timeout === false) {
                                    checkPosition();
                                }
                            }
                        }).catch(checkPosition);
                    }, c.pollingPeriod);
                };
                checkPosition();
            }
        });
    }

    async getStatus() {
        let status = {};
        status.temperature = await this.getTemperature();
        status.voltage = await this.getVoltage();
        status.load = await this.getLoad();
        status.firmwareVersion = await this.getFirmwareVersion();
        status.position = await this.getPosition();
        status.speed = await this.getSpeed();
        return status;
    }

    setPunch(current) {
        return this._writeWord(DynamixelDriver.AX_PUNCH_L, current);
    }

    setId(id) {
        return this._writeByte(DynamixelDriver.AX_SERVO_ID, id);
    }

    setBaudrate(baudrate) {
        let baudPairs = {
            1000000: 0x01,
            500000: 0x03,
            400000: 0x04,
            250000: 0x07,
            200000: 0x09,
            115200: 0x10,
            57600: 0x22,
            19200: 0x67,
            9600: 0xCF
        };
        if (baudPairs.hasOwnProperty(baudrate)) {
            return this._writeByte(DynamixelDriver.AX_BAUD_RATE, baudPairs[baudrate]);
        } else {
            return new Promise((resolve, reject) => {
                Mep.Log.error(TAG, this.name, 'Invalid baud rate');
                reject();
            });
        }
    }

    getLastPosition() {
        return this._lastPosition;
    }

    setPosition(position) {
        this._lastPosition = position;

        if (position > this.config.maxPosition || position < this.config.minPosition) {
            Mep.Log.error(TAG + ':' + this.name, 'Position out of range!');
        } else {
            this._writeWord(DynamixelDriver.AX_GOAL_POSITION_L, position | 0);
        }
    }

    setSpeed(speed, inverse = false) {
        if (speed > 1023 || speed < 0) {
            Mep.Log.error(TAG, this.name, 'Speed out of range!');
            return;
        }

        if (inverse === true) {
            speed = (1 << 10) | speed;
        }

        this._writeWord(DynamixelDriver.AX_GOAL_SPEED_L, speed | 0);
    }

    setCWAngleLimit(angle) {
        this._writeWord(DynamixelDriver.AX_CW_ANGLE_LIMIT_L, angle | 0);
    }

    setCCWAngleLimit(angle) {
        this._writeWord(DynamixelDriver.AX_CCW_ANGLE_LIMIT_L, angle | 0);
    }

    setLED(on) {
        this._writeByte(DynamixelDriver.AX_LED, on | 0);
    }

    _writeWord(address, word) {
        this.communicator.send(
            this.config.cid,
            Buffer.from([
                this.config.id,     // AX12 ID
                0x05,               // Length
                0x03,               // Write
                address,            // Address (function)
                word & 0xFF,
                (word >> 8) & 0xFF
        ]));
    }

    _writeByte(address, byte) {
        this.communicator.send(
            this.config.cid,
            Buffer.from([
                this.config.id,     // AX12 ID
                0x04,               // Length
                0x03,               // Write
                address,            // Address (function)
                byte & 0xFF         // Param
        ]));
    }

    _read(address, word = false) {
        let ax = this;
        let buffer = Buffer.from([
            this.config.id,     // AX12 ID
            0x04,               // Length
            0x02,               // Read
            address,            // Address (function)
            word ? 0x02 : 0x01
        ]);

        return new Promise((resolve, reject) => {
            if (ax.config.id === 0xFE) {
                reject(new TaskError(TAG, 'broadcast', 'Cannot use broadcast ID for reading'));
                return;
            }



            ax.uniqueDataReceivedCallback = (data) => {
                // Catch error code
                if (data.readUInt8(2) !== 0x00) {
                    Mep.Log.error(TAG, this.name, 'Response error', data.readUInt8(2));
                    reject(data.readUInt8(2));
                    return;
                }

                if (word === true && data.length > 4) {
                    resolve(
                        (data.readUInt8(4) << 8) |
                        (data.readUInt8(3) & 0xFF)
                    );
                } else if (data.length > 3) {
                    resolve(data.readUInt8(3));
                }
                ax.uniqueDataReceivedCallback = null;
            };

            ax.communicator.send(
                ax.config.cid,
                buffer
            );
        });
    }

    getGroups() {
        return ['control'];
    }
}

module.exports = DynamixelDriver;