/**
 * WebSocket Telemetry Transmitter
 */
const BunyanWebSocket = require('./websocket/bunyan-stream-websocket');


function webSocketTransmitter(config) {
    let webSocketConfig = {
        active: false,
        host: "ws://localhost:1234"
    };

    if (config) {
        webSocketConfig = Object.assign(webSocketConfig, config);
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