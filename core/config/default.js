module.exports = {
    Simulation: false,
    Table: 'table_1_red',

    Drivers: {
        MotionDriver: {
            class: 'drivers/motion/MotionDriver',
            init: [0, 0],
        },

        ModbusDriver: {
            class: 'drivers/modbus/ModbusDriver',
            init: true,
        }
    }
};