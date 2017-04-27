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
                new TunedPoint(0, -150, [ 25, -150, 'blue' ]),
                { speed: 110, backward: true, tolerance: 0, radius: 200 });
            await Mep.Motion.go(
                new TunedPoint(0, -30, [ 0, 0, 'blue' ]),
                { speed: 110, backward: true });
            await Mep.Motion.go(
                new TunedPoint(0, 25, [ 25, -200, 'blue' ]),
                { speed: 110, backward: true });
        }
        catch (e) {
            Mep.Log.error(TAG, 'backward', e);
            await Delay(500);
            try { await Mep.Motion.straight(100); } catch (e) { console.log('forward'); }
            this.suspend();
            suspended = true;
        }

        // Push
        if (suspended === false) {
            try {
                await this.common.push();
                this.finish();
            } catch (e) {
                Mep.Log.error(TAG, e);
                this.suspend();
            }
        }

        lunar.standby().catch(() => {});
    }

    isAvailable() {
        return (lunar.isEmpty() === false);
    }
}

module.exports = PushMiddleCartridgeTask;