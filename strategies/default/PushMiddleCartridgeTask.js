const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');

const TAG = 'PushMiddleCartridgeTask';

class PushMiddleCartridgeTask extends Task {
    async onRun() {
        let suspended = false;

        // Move to position to go back
        try {
            await Mep.Motion.go(
                new TunedPoint(10, -100, [ 0, -150, 'blue' ]),
                { speed: 210, backward: true, tolerance: 0, radius: 200, obstacle: 500, friend: 5000 });
            await Delay(100);
            await Mep.Motion.go(
                new TunedPoint(30, -20, [ 0, -20, 'blue' ]),
                { speed: 110, backward: true });
            await Mep.Motion.go(
                new TunedPoint(30, 30, [ 0, 30, 'blue' ]),
                { speed: 50, backward: true });
        }
        catch (e) {
            Mep.Log.error(TAG, e);

            if (e.action === 'stuck') {
                await Delay(500);
                Mep.Motion.straight(200, { opposite: true });
            }

            this.suspend();
            suspended = true;
        }

        // Push
        if (suspended === false) {
            try {
                this.common.robot.monochromeModules = 0;
                await this.common.push();
                this.finish();
            } catch (e) {
                Mep.Log.error(TAG, e);
                this.suspend();
            }
            lunar.standby().catch(() => {});
        }
    }

    isAvailable() {
        console.log(TAG, lunar.isEmpty(), this.common.robot.colorfulModules);
        return (lunar.isEmpty() === false && this.common.robot.colorfulModules <= 1);
    }
}

module.exports = PushMiddleCartridgeTask;
