const Scheduler = Mep.require('strategy/Scheduler');
const Point = Mep.require('misc/Point');
const TunedPoint = Mep.require('strategy/TunedPoint');
const Delay = Mep.require('misc/Delay');
const lunar = Mep.getDriver('LunarCollector');

// Tasks
const InitTask = require('./InitTask');
const CollectBackRocketTask = require('./CollectBackRocketTask');
const CollectStartRocketTask = require('./CollectStartRocketTask');
const PushSideCartridgeTask = require('./PushSideCartridgeTask');
const PushMiddleCartridgeTask = require('./PushMiddleCartridgeTask');
const EjectStartCartridgeTask = require('./EjectStartCartridgeTask');
const Module1Task = require('./Module1Task');
const Module2Task = require('./Module2Task');
const Module3Task = require('./Module3Task');
const Module4Task = require('./Module4Task');
const Module5Task = require('./Module5Task');
const FinalTask = require('./FinalTask');
const myTestTask = require('./myTestTask');

const TAG = 'DefaultScheduler';

class DefaultScheduler extends Scheduler {
    constructor() {
        super();

        this._finalTaskExecuted = false;
        this._finalTask = new FinalTask(this, { weight: 10000, time: 0 });
		this.tasks2 = [
			new myTestTask(this, {})
		];
        this.tasks = [
            new InitTask(this, { weight: 10000, time: 10 }),

            new CollectStartRocketTask(this, { weight: 1000, time: 20 }),
            new PushMiddleCartridgeTask(this, {
                weight: 980,
                time: 3,
                avoidanceStrategy: 'reject',
                avoidanceStrategyDelay: 5000 }),

            // new Module1Task(this, { weight: 920, time: 10 }),
            new Module2Task(this, { weight: 900, time: 10 }),
            // new Module3Task(this, { weight: 780, time: 5 }),
            new Module5Task(this, { weight: 775, time: 5 }), //NOTE: Namesteno
            new Module4Task(this, { weight: 770, time: 5 }), //NOTE: krzne kad se okrene
            new PushSideCartridgeTask(this, { weight: 760, time: 3 }),

            new CollectBackRocketTask(this, { weight: 600, time: 20 }),
            new EjectStartCartridgeTask(this, { weight: 590, time: 7 })
        ];

        this._onTick = this._onTick.bind(this);
        this._newPush = this._newPush.bind(this);
        this._collect = this._collect.bind(this);
        this._collect2 = this._collect2.bind(this);

        // Init task is always first
        this.runTask(this.tasks[0]);

        // Common
        this.common.push = this._newPush;
        this.common.collect = this._collect;
        this.common.collect2 = this._collect2;
        this.common.terrain = {
            startRocketModules: 4,
            backRocketModules: 4,
            middleCartridgeModules: 0,
            sideCartridgeModules: 0,
            startCartridgeModules: 0,
            lunar3Available: true
        };
        this.common.robot = {
            colorfulModules: 0,
            monochromeModules: 0,
            rejectedOnTheMiddle: false
        };

        // Last task
        this._starterDriver = Mep.getDriver('StarterDriver');
        this._starterDriver.on('tick', this._onTick);
    }

    _onTick(secondsPassed) {
        console.log('Seconds passed', secondsPassed);
        if (secondsPassed > (Mep.Config.get('duration') - 3) && this._finalTaskExecuted === false) {
            this.runTask(this._finalTask);
            this._finalTaskExecuted = true;
        }
    }

    async _push() {
        // We can rotate one module
        if (this.common.robot.colorfulModules >= 1) {
            try { await lunar.rotate(); } catch (e) {}
            this.common.robot.colorfulModules--;
        }

        //lunar.prepare().catch(() => {});
        try { await lunar.limiterOpenSafe(); } catch (e) {}
        try { lunar.collect(500); } catch (e) {}

        // Wait to empty
       await Delay(1000);
        for (let i = 0; i < 10; i++) {
            await Delay(600);
            if (lunar.isEmpty() === true) {
                break;
            }

            // Go up-down with limiter
            if (lunar.isLastOnly() === true) {
                if (i % 5 === 0) {
                    // lunar.limiterOpen();
                } else {
                    //lunar.limiterPrepare();
                }
            }
        }
        lunar.limiterOpen();
        await Delay(200);

        //zakomentarisali: djole i blazic
        //isao napred nazad dva puta
        //testirati kako ce se ponasati bez ovog napred-nazad

        //await Mep.Motion.straight(30);
        //await Mep.Motion.straight(-30);

        // Last module
        lunar.prepare().catch(() => {});
        // START: Budz za izbacivanje posljednje zaglavljenog valjka
        await Delay(2000);// Sta ce nam Delay?
        for (let i = 0; i < 10; i++) {
            await Delay(600);
            if (lunar.isEmpty() === true) {
                break;
            }

            // Go up-down with limiter
            if (lunar.isLastOnly() === true) {
                if (i % 5 === 0) {
                    lunar.limiterOpen();
                } else {
                    lunar.limiterPrepare();
                }
            }
        }
        lunar.limiterOpen();
        await Delay(600);
        // await Mep.Motion.straight(30);
        // await Mep.Motion.straight(-30);
        lunar.prepare().catch(() => {});
        // END: Budz

        lunar.trackStop();
        await Mep.Motion.straight(100);
    }

    async _newPush(){
      if (this.common.robot.colorfulModules >= 1) {
          try { await lunar.rotate(); } catch (e) {}
          this.common.robot.colorfulModules--;
      }
      try { await lunar.limiterOpenSafe(); } catch (e) {}
      try { lunar.prepare(); /*lunar.collect(500);*/ } catch (e) {}
      for(let i=0;i<4;i++){
        if (lunar.isEmpty() === true) {
            break;
        }
        lunar.trackStart();
        await Delay(500);
        await Mep.Motion.straight(30);
        await Mep.Motion.straight(-30);
        lunar.collect();
        await Delay(500);
      }
      await Mep.Motion.straight(150);
    }
    async _collect2() {
        let numberOfFails = 0;
        try {
            lunar.limiterClose().catch((e) => {
                Mep.Log.error(TAG, 'Lunar.closeLimiter', e);
            });
            for (let i = 0; i < 2; i++) {
                try {
                  if(i == 0){
                    await lunar.collect();
                    // await Delay(500);
                  }
                  if(i == 1){
                    await lunar.collect(500);
                    await lunar.prepare();
                    await lunar.collect(500);
                  }
                } catch (e) {
                    Mep.Log.error(TAG, 'Lunar.collect', e);
                }
               try {
                    await Mep.Motion.straight(-40);
                } catch (e) {
                    Mep.Log.error(TAG, 'Motion.straight', e);
                }
                //await Delay(1500);
                /* lunar.prepare().catch((e) => {
                    Mep.Log.error(TAG, 'Lunar.prepare', e);
                });*/
                try {
                    await Mep.Motion.straight(40)
                } catch (e) {
                    Mep.Log.error(TAG, 'Motion.straight', e);
                }

                if (lunar.numberOfModules() === 0) {
                    i--;
                    numberOfFails++;
                }
                if (numberOfFails === 2) {
                    break;
                }


            }
            //lunar.trackStop();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }
    }

    async _collect() {
        try {
            await this._collect2();

            try { await lunar.collect(); } catch (e) { Mep.Log.error(TAG, 'Lunar.collect', e); }
            await Delay(2000);
            lunar.prepare().catch(() => { Mep.Log.error(TAG, 'Lunar.prepare', e); });
            await Delay(1000);

            try { await lunar.collect(); } catch (e) { Mep.Log.error(TAG, 'Lunar.collect', e); }
            await Delay(500);
            lunar.hold();
            lunar.trackStop();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }
    }
}

module.exports = DefaultScheduler;
