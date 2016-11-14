const WebSocket = require('ws');

const TAG = 'WebSocketClient';

let instance = null;

class WebSocketClient extends WebSocket {
    static getInstance() {
        if (instance === null) {
            instance = new WebSocketClient();
        }
        return instance;
    }

    constructor() {
        super('ws://127.0.0.1:8080');

        let webSocketClient = this;
        this.opened = false;

        this.on('error', () => { Mep.Log.error(TAG, 'Please run simulator\'s server by `./simulator`'); });
        this.on('open', () => { webSocketClient.opened = true; });
    }

    send(data) {
        if (this.opened === true) {
            super.send(data);
        } else {
            Mep.Log.warn(TAG, 'Simulator server is not opened');
        }
    }
}

module.exports = WebSocketClient;