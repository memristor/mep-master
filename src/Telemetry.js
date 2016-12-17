const Config = require('./Config');
const _ = require('lodash');
const Bunyan = require('bunyan');

let telemetryConfig = Config.get('Telemetry');

if (telemetryConfig === '' || telemetryConfig === undefined) {
    throw 'Telemetry Configuration missing.';
}

let streams = [];
let transmissionConfig = telemetryConfig.transmission;
// dynamic logger loader
_.each(transmissionConfig, function (transmissionConfig, transmissionClass) {
    let logger = require('./telemetrics/' + transmissionClass + 'Transmiter')(transmissionConfig);
    if (logger !== undefined) {
        streams.push(logger);
    }
});

let simpleTelemetricLogger = Bunyan.createLogger({
    name: 'mep_telemetric',
    streams: streams
});

// init telemetry information system
let telemetryTransmissionModule = undefined;
// maximum messages stack in, over this limit older messages are lost
let telemetryStackThreshold = telemetryConfig.stackThreshold || 1000;

// in a multi threaded environment input stack should be separated from transmission stack to avoid resource lock.
let telemetryStackFlip = [];
let telemetryStackFlop = [];
let flipFlop = false;
let stackCount = 0;
let transmitting = false;

function transmit(measure) {
    let stack = (flipFlop) ? telemetryStackFlip : telemetryStackFlop;
    if (stackCount > telemetryStackThreshold) {
        stack.shift();
    }
    stack.push(measure);
}

function transmission() {
    if (transmitting) {
        return;
    }

    transmitting = true;
    try {
        flipFlop = !flipFlop;
        stackCount = 0;

        if (telemetryConfig.active === true) {
            // now we ve time to process transmission
            let stack = (!flipFlop) ? telemetryStackFlip : telemetryStackFlop;
            _.each(stack, function (measure) {
                simpleTelemetricLogger.info(measure);
            });
        }

        if (!flipFlop) {
            telemetryStackFlip = [];
        } else {
            telemetryStackFlop = [];
        }
    } catch (e) {

    } finally {
        transmitting = false;
    }
}

setInterval(function () {
    transmission();
}, telemetryConfig.transmissionRate || 1000);


let telemetryFunction = function (tag, metric, value) {
    let telemetryMeasure = {
        date: Date.now(),
        tag: tag,
        metric: metric,
        value: value
    };
    transmit(telemetryMeasure);
};

module.exports = telemetryFunction;
