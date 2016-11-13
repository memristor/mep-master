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
    }
}

module.exports = WebSocketClient;