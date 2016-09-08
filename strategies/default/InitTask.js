const Task = MepRequire('utils/Task');
const DriverManager = MepRequire('DriverManager');

class InitTask extends Task {
    constructor(robot) {
        super();

        this.motionDriver = DriverManager.get().getDriver(DriverManager.MOTION_DRIVER);
        this.modbusDriver = DriverManager.get().getDriver(DriverManager.MODBUS_DRIVER);
    }

    onRun() {
        var that = this;

		var slaveAddress = 1;
		var functionAddress = 7; // Ono gore cudo
		this.modbusDriver.registerCoilReading(slaveAddress, functionAddress);
		this.modbusDriver.on('coilChanged', function(slaveAddress, functionAddress, state, id) {
		    //that.motionDriver.stop();

		    console.log('Coil Changed! Slave address: ' + slaveAddress + '; Function address: ' +
		        functionAddress + '; State: ' + state);
		});
	


	//this.motionDriver.moveToPosition(100, 100, 1);
	//this.motionDriver.moveStraight(100);
    }
}

module.exports = InitTask;
