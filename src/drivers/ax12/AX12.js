const TAG = 'AX12';

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


        if (this.uniqueDataReceivedCallback !== null) {
            this.uniqueDataReceivedCallback(data);
        } else if (this.config.id !== 0xFE) {
            Mep.Log.warn(TAG, this.name, 'Unhandled response', data);
        }
    }

    init(callback) {
        callback();
        // Check status
    }

    getTemperature() {
        return this._readByte(AX12.AX_PRESENT_TEMPERATURE);
    }

    async getVoltage() {
        let val = await this._readByte(AX12.AX_PRESENT_VOLTAGE);
        return val / 10;
    }

    getLoad() {
        return this._readByte(AX12.AX_PRESENT_LOAD_L);
    }

    getTorqueLimit() {
        return this._readByte(AX12.AX_TORQUE_LIMIT_L);
    }

    getFirmwareVersion() {
        return this._readByte(AX12.AX_VERSION);
    }

    async getStatus() {
        let status = {};
        status.temperature = await this.getTemperature();
        status.voltage = await this.getVoltage();
        status.load = await this.getLoad();
        status.firmwareVersion = await this.getFirmwareVersion();
        return status;
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

    _readByte(address) {
        let ax = this;
        let buffer = Buffer.from([
            this.config.id,     // AX12 ID
            0x04,               // Length
            0x02,               // Read
            address,            // Address (function)
            0x01
        ]);

        return new Promise((resolve, reject) => {
            if (ax.config.id === 0xFE) {
                Mep.Log.error(TAG, this.name, 'Cannot use broadcast ID for reading');
                reject();
                return;
            }

            ax.uniqueDataReceivedCallback = (data) => {
                resolve(data.readUInt8(3));
                ax.uniqueDataReceivedCallback = null;
            };
            ax.communicator.send(
                ax.config.canId,
                buffer
            );
        });
    }
}

module.exports = AX12;