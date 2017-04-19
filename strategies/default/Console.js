class Console {
    // Simplified functions for prompt
    async go(x, y, config) {
        await Mep.Motion.go(new TunedPoint(x, y), config);
    }

    async rotate(angle, config) {
        await Mep.Motion.rotate(new TunedAngle(angle), config);
    }

    straight(val) {
        Mep.Motion.straight(val);
    }

    async home() {
        await Mep.Motion.go(new TunedPoint(-1300, 0), { pf: true, tolerance: -1, speed: 100, backward: true });
        await Delay(200);
        await Mep.Motion.rotate(new TunedAngle(0));
    }

    get m() {
        return Mep.getDriver('MotionDriver');
    }

    c(a, b) {
        Mep.getDriver('MotionDriver').setConfig(a, b);
    }

    r(a) {
        Mep.getDriver('MotionDriver').getConfig(a);
    }

    async test() {
        //Mep.getDriver('MotionDriver').reset();
        //Mep.getDriver('MotionDriver').setRefreshInterval(50);

        this.c(9, 332); // 329.5
        this.c(10, 90); // 92.6
        this.c(11, 92.6); // 92.6

        for (let i = 0; i < 0; i++) {
            Mep.getDriver('MotionDriver').setSpeed(70);
            await Mep.getDriver('MotionDriver').moveToPosition(new Point(0, -500));

            await Mep.getDriver('MotionDriver').moveToPosition(new Point(-1000, -500));
            await Mep.getDriver('MotionDriver').moveToPosition(new Point(-1000, 0));
            await Mep.getDriver('MotionDriver').moveToPosition(new Point(0, 0));
        }
    }
}

module.exports = Console;