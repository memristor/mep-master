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

        }, this.config);
        this.communicator = Mep.DriverManager.getDriver(this.config['@dependencies'].communicator);
    }

    init(callback) {
        callback();
        // Check status
    }

    setPosition(position) {
        this._writeWord(AX12.AX_GOAL_POSITION_H, (position * (1023 / 360)) | 0);
    }

    _writeWord(address, word) {
        this.communicator.send(
            this.config.id,
            Buffer.from([
                'W'.charCodeAt(0),
                (word >> 8) & 0xFF,
                word & 0xFF
        ]));
    }

    _writeByte(address, byte) {
        this.communicator.send(
            this.config.id,
            Buffer.from([
                'w'.charCodeAt(0),
                byte & 0xFF
        ]));
    }
}

module.exports = AX12;