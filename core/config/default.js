module.exports = {
    Simulation: false,
    Table: 'table_1_red',

    Drivers: {
        MotionDriver: {
            class: './motion/MotionDriver',
            init: [0, 0],
        },

        ModbusDriver: {
            class: './modbus/ModbusDriver',
            init: true,
        }
    }
};