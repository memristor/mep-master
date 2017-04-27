const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');
const funnyServo = Mep.getDriver('FunnyServo');
const lunar = Mep.getDriver('LunarCollector');

const TAG = 'FinalTask';

class FinalTask extends Task {
    async onRun() {
        try {
            Mep.Motion.stop(true);
            lunar.turnOff();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        Mep.getDriver('CanDriver').disable();
        Mep.getDriver('Uart').disable();

        await Delay(2000);

        // Last command block
        Mep.getDriver('CanDriver').enable();
        funnyServo.write(70);
        Mep.getDriver('CanDriver').disable();
    }
}

module.exports = FinalTask;