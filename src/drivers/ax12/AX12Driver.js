'use strict';

/** @namespace drivers.ax12 */

const TAG = 'AX12';


/**
 * Communicates with AX12 servos.
 * NOTE: This class doesn't send start bytes & checksum, please make custom `communicator`
 * (`@dependecies.communicator`) if you want these features.
 * @memberOf drivers.ax12
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class AX12 {
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
            canId: 2000,
            id: 0xFE
        }, config);
        this.name = name;

        this._onDataReceived = this._onDataReceived.bind(this);

        this.uniqueDataReceivedCallback = null;

        this.communicator = null;
        if (this.config._communicator !== undefined) {
            // For testing purposes only (experiments)
            this.communicator = this.config._communicator;
        } else {
            this.communicator = Mep.DriverManager.getDriver(this.config['@dependencies'].communicator);
        }
        this.communicator.on('data_' + this.config.canId, this._onDataReceived);
    }

    _onDataReceived(data) {
        // Length === 1 means there is an error in communication (UART, Servo <--> AVR)
        if (data.length === 1) {
            switch(data.readInt8(0)) {
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

        if (data.readUInt8(0) === (this.config.id | 0)) {
            if (this.uniqueDataReceivedCallback !== null) {
                this.uniqueDataReceivedCallback(data);
            }
        }
    }

    init(callback) {
        callback();
        // Check status
    }

    getTemperature() {
        return this._read(AX12.AX_PRESENT_TEMPERATURE);
    }

    async getVoltage() {
        let val = await this._read(AX12.AX_PRESENT_VOLTAGE);
        return val / 10;
    }

    getLoad() {
        return this._read(AX12.AX_PRESENT_LOAD_L);
    }

    getTorqueLimit() {
        return this._read(AX12.AX_TORQUE_LIMIT_L);
    }

    getFirmwareVersion() {
        return this._read(AX12.AX_VERSION);
    }

    async getPosition() {
        let position = await this._read(AX12.AX_PRESENT_POSITION_L, true);
        return ((position * (300 / 1023)) | 0);
    }

    getSpeed() {
        return this._read(AX12.AX_PRESENT_SPEED_L, true);
    }

    /**
     * Set servo to required position and get promise when position is reached
     * @param position {Number} - Required position in degrees
     * @param config.pollingPeriod {Number} - Polling period for servo's present position in ms
     * @param config.tolerance {Number} - Tolerated error in degrees
     * @param config.timeout {Number} - Maximal time servo to reach a position in ms
     * @param config.firmwareImplementation {Boolean} - Should it use firmware (true) or software (false) implementation.
     * Firmware implementation is faster, however in that case we have to have a dedicated hardware (our actuator board supports it).
     */
    go(position, config) {
        let c = Object.assign({
            pollingPeriod: 40,
            tolerance: 3,
            timeout: 1000,
            firmwareImplementation: false
        }, config);

        let ax = this;
        let timeout = false;
        this.setPosition(position);

        return new Promise((resolve, reject) => {
            // Apply time out
            setTimeout(() => {
                timeout = true;
                reject();
            }, c.timeout);

            if (c.firmwareImplementation === true) {
                // Firmware polling implementation
                throw Error('Firmware implementation is not implemented');
                this._writeWord(
                    AX12.AX_POLL_POSITION,
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
                        });
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
        return this._writeWord(AX12.AX_PUNCH_L, current);
    }

    setId(id) {
        return this._writeByte(AX12.AX_SERVO_ID, id);
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
            return this._writeByte(AX12.AX_BAUD_RATE, baudPairs[baudrate]);
        } else {
            return new Promise((resolve, reject) => {
                Mep.Log.error(TAG, this.name, 'Invalid baud rate');
                reject();
            });
        }
    }

    setPosition(position) {
        if (position > 300 || position < 0) {
            Mep.Log.error(TAG, this.name, 'Position out of range!');
            return;
        }

        this._writeWord(AX12.AX_GOAL_POSITION_L, (position * (1023 / 300)) | 0);
    }

    setSpeed(speed) {
        if (speed > 1023 || speed < 0) {
            Mep.Log.error(TAG, this.name, 'Speed out of range!');
            return;
        }

        this._writeWord(AX12.AX_GOAL_SPEED_L, speed | 0);
    }

    setCWAngleLimit(angle) {
        this._writeWord(AX12.AX_CW_ANGLE_LIMIT_L, (angle * (1023 / 300)) | 0);
    }

    setCCWAngleLimit(angle) {
        this._writeWord(AX12.AX_CCW_ANGLE_LIMIT_L, (angle * (1023 / 300)) | 0);
    }

    setLED(on) {
        this._writeByte(AX12.AX_LED, on | 0);
    }

    _writeWord(address, word) {
        this.communicator.send(
            this.config.canId,
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
            this.config.canId,
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
                Mep.Log.error(TAG, this.name, 'Cannot use broadcast ID for reading');
                reject();
                return;
            }

            ax.uniqueDataReceivedCallback = (data) => {
                // Catch error code
                if (data.readUInt8(2) !== 0x00) {
                    Mep.Log.error(TAG, this.name, 'Response error', data.readUInt8(2));
                    reject(data.readUInt8(2));
                    return;
                }

                if (word === true) {
                    resolve(
                        (data.readUInt8(4) << 8) |
                        (data.readUInt8(3) & 0xFF)
                    );
                } else {
                    resolve(data.readUInt8(3));
                }
                ax.uniqueDataReceivedCallback = null;
            };

            ax.communicator.send(
                ax.config.canId,
                buffer
            );
        });
    }

    getGroups() {
        return ['control'];
    }
}

module.exports = AX12;