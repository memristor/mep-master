const EventEmitter = require('events').EventEmitter;

const TAG = 'CanDriverSimulator';

class CanDriverSimulator extends EventEmitter {
    constructor(name, config) {
        super();

        let canDriverSimulator = this;

        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'Data'), (packet) => {
            canDriver.emit('data_' + packet.params.id, packet.params.data);
            canDriver.emit('data', packet.params.id, packet.params.data);
        });
    }

    getGroups() {
        return [];
    }
}

module.exports = CanDriverSimulator;