const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

// Drivers
const ballPicker = Mep.getDriver('BallPicker');
const directionBall = Mep.getDriver('DirectionBall');


const TAG = 'SmallHoleTask';

class SmallHoleTask extends Task {
    async onRun() {
        /*
		Mep.Position.on('positionChanged', (pos) => {
			if( (pos.getDistance(new TunedPoint(-450, -450, [450, -450, 'blue']).getPoint()) < 200 ) ) {
                this.common.lowerDirBall();
				Mep.Position.on('positionChanged', (pos2) => {
					if( (pos2.getDistance(new TunedPoint(-450, -450, [450, -450, 'blue']).getPoint()) > 200 ) ) {
						directionBall.setPosition(100);
					}
				});
			}
		});
		*/

        try {
            await Mep.Motion.go(new TunedPoint(-450, -450, [450, -450, 'blue']), {
                obstacle: 1000, friend: 2000, speed: 100, backward: false });

            this.common.lowerDirBall();
            try {
                await Mep.Motion.go(new TunedPoint(-750, -450, [750, -450, 'blue']), {speed: 50, backward: true});
            } catch (e) {}
            await this.common.pick();
            this.common.robot.ballsLoaded = true;

            await Mep.Motion.straight(100);

            this.common.lowerDirBall();
            this.finish();
        } catch (e) {
            switch (e.action) {
                case 'stuck':
                    await Delay(500);
                    try { await Mep.Motion.straight(100, { opposite: true }); } catch (e) { Mep.Log.error(TAG, e); }
                    break;

                case 'friend':
                    // Friend robot is detected and detection timeout is exceeded
                    break;

                case 'obstacle':
                    // Obstacle is detected and detection timeout is exceeded
                    break;
            }

            // You have to finish or suspend task
            this.suspend();
        }
    }
   
   /* 
    _onTick(secondsPassed) {
		console.log('Seconds passed', secondsPassed);
		if (secondsPassed > (Mep.Config.get('duration') - 3) && this._finalTaskExecuted === false) {
			this._finalTaskExecuted = true;
			// this.runTask(this._finalTask);
			// this._finalTaskExecuted = true;
		}
	}
	*/

    isAvailable() {
        return (this.common.robot.ballsLoaded === false);
    }
}




module.exports = SmallHoleTask;
