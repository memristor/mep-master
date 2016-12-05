const Task = Mep.require('types/Task');
const TunedPoint = Mep.require('types/TunedPoint');
const Point = Mep.require('types/Point');
const Delay = Mep.require('utils/Delay');
const position = Mep.getPositionService();

class InitTask extends Task {
    async onRun() {
        // Wait WebSocketClient to connect to WebSocketServer
        await Delay(200);

        // Let's move around
        await position.set(new TunedPoint(1100, 0), {speed: 130});
        await position.set(new TunedPoint(-1300, 0));
    }

}

module.exports = InitTask;
