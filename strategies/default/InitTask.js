const Task = Mep.require('utils/Task');
const TunedPoint = Mep.require('types/TunedPoint');
const Delay = Mep.require('utils/Delay');
const position = Mep.getPositionService();

class InitTask extends Task {
    async onRun() {
        // Wait WebSocketClient to connect to WebSocketServer
        await Delay(200);

        // Let's move around
        await position.set(new TunedPoint(-735, -850), { pathfinding: true });
        await position.set(new TunedPoint(765, -850), { pathfinding: true });
        await position.set(new TunedPoint(-1200, 400), { pathfinding: true });
        await position.set(new TunedPoint(-170, 820), { pathfinding: true });
    }

}

module.exports = InitTask;
