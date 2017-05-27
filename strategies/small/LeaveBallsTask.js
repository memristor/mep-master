const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

const directionBall = Mep.getDriver('DirectionBall');

const TAG = 'LeaveBallsTask';

class LeaveBallsTask extends Task {
    async onRun() {
		
        try {
			
			// // start position for yellow -1200, -790
			// +750 +340
			// left of ramp
            //await Mep.Motion.go(new TunedPoint(-450, -450, [450, -450, 'blue']), { speed: 50, backward: true, pf: true });
            /*
            while (true) {
                if (this.common.leaveBallEnabled === false) {
                    break;
                }
                await Delay(300);
            }*/

            //this.common.lowerDirBall();
            await Mep.Motion.go(new TunedPoint(-512, -156, [512, -156, 'blue']), { speed: 80, backward: false });
			await Mep.Motion.go(new TunedPoint(-900, -100, [900, -100, 'blue']), { speed: 80, backward: false });
			await Mep.Motion.go(new TunedPoint(-1200, -400, [1315, -400, 'blue']), { speed: 80, backward: false });
			await Mep.Motion.go(new TunedPoint(-1200, -514, [1296, -514, 'blue']), { speed: 80, backward: true });
			//this.common.liftDirBall();
			try { await Mep.Motion.straight(-100, { speed: 30 }); } catch(e) {}
			await this.common.leave();
			await Mep.Motion.go(new TunedPoint(-1200, -450, [1296, -400, 'blue']), { speed: 80, backward: true });
			await Mep.Motion.go(new TunedPoint(-1000, -450, [1296, -400, 'blue']), { speed: 80, backward: true });
			
			try { await Mep.Motion.straight(-100, { speed: 30 }); } catch(e) {}
			await this.common.pick();
			
			await Mep.Motion.go(new TunedPoint(-1200, -450, [1296, -400, 'blue']), { speed: 80, backward: true });
			await Mep.Motion.go(new TunedPoint(-1200, -514, [1296, -514, 'blue']), { speed: 80, backward: true });
			try { await Mep.Motion.straight(-100, { speed: 30 }); } catch(e) {}
			await this.common.leave();
			try { await Mep.Motion.straight(50); } catch(e) {}
			this.finish();

        } catch (e) {
            switch (e.action) {
                case 'stuck':
                    await Delay(500);
                    try { await Mep.Motion.straight(200, { opposite: true }); } catch (e) { Mep.Log.error(TAG, e); }
                    break;

                case 'friend':
                    // Friend robot is detected and detection timeout is exceeded
                    break;

                case 'obstacle':
                    // Obstacle is detected and detection timeout is exceeded
                    break;
            }
            Mep.Log.error(TAG, e);

            // You have to finish or suspend task
            this.suspend();
            
        }
    }

    isAvailable() {
        return (this.common.robot.ballsLoaded === true);
    }
}

module.exports = LeaveBallsTask;
