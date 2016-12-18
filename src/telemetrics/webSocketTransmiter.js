/**
 * WebSocket Telemetry Transmitter
 */
const _ = require('lodash');
const BunyanWebSocket = require('./websocket/bunyan-stream-websocket');


function webSocketTransmitter(config) {
    let webSocketConfig = {
        active: false,
        host: "ws://localhost:1234"
    };

    if (config) {
        webSocketConfig = _.defaults(config, webSocketConfig)
    }

    if (webSocketConfig.active === true) {
        return {
            level: 'debug',
            stream: new BunyanWebSocket({
                host: webSocketConfig.host
            })
        };
    }

    return undefined;
}

module.exports = webSocketTransmitter;