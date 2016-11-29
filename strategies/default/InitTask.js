const Task = Mep.require('types/Task');
const TunedPoint = Mep.require('types/TunedPoint');
const Point = Mep.require('types/Point');
const Delay = Mep.require('utils/Delay');
const position = Mep.getPositionService();

class InitTask extends Task {
    async onRun() {
        // Wait WebSocketClient to connect to WebSocketServer
        await Delay(200);

	await position.set(new TunedPoint(1100, 0), { speed: 130 });
        await position.set(new TunedPoint(-1300, 0));


	if (false) {
		await position.set(new TunedPoint(-1100, 0), { speed: 40 });
		await position.arc(new Point(-1300, 100), 30, 1);
		await position.arc(new Point(-1300, 100), 60, 1);
	}

	if (false) {
		await position.set(new TunedPoint(-1200, 0), { speed: 40 });
		await position.set(new TunedPoint(-735, -850), { pathfinding: true });
		await position.set(new TunedPoint(765, -850), { pathfinding: true });
		await position.set(new TunedPoint(-1200, 0), { pathfinding: true });
	}

	//await position.set(new TunedPoint(-1300, 0));

        // Let's move around
        //await position.set(new TunedPoint(-735, -850), { pathfinding: true });
        //await position.set(new TunedPoint(765, -850), { pathfinding: true });
        //await position.set(new TunedPoint(-1200, 400), { pathfinding: true });
        //await position.set(new TunedPoint(-170, 820), { pathfinding: true });
    }

}

module.exports = InitTask;
