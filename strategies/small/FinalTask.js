const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');

const TAG = 'FinalTask';

const colorRotator = Mep.getDriver('ColorRotator');

class FinalTask extends Task {
    async onRun() {
        try {
            // Turn off motors
            Mep.Motion.stop(true);
            colorRotator.write(0);

            // Disable all communication protocols
            Mep.getDriver('CanDriver').disable();

            // Wait a little for funny action
            await Delay(3000);

            // Last command block
            Mep.getDriver('CanDriver').enable();
            // Run here a funny action
            Mep.getDriver('CanDriver').disable();
        } catch (e) {

        }
    }
}

module.exports = FinalTask;