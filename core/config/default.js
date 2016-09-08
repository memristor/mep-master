module.exports = {
    Simulation: false,
    Table: 'table_1_red',

    Drivers: {
        MotionDriver: {
            class: './motion/MotionDriver'
        },

        ModbusDriver: {
            class: './modbus/ModbusDriver',
        }
    }
};