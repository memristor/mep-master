const TAG = 'FinalTask';

class FinalTask extends Task {
    async onRun() {
        // Turn off motors
        Mep.Motion.stop(true);

        // Disable all communication protocols
        Mep.getDriver('CanDriver').disable();
        Mep.getDriver('Uart').disable();

        // Wait a little for funny action
        await Delay(3000);

        // Last command block
        Mep.getDriver('CanDriver').enable();
        // Run here a funny action
        Mep.getDriver('CanDriver').disable();
    }
}

module.exports = FinalTask;