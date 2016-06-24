const Log = require(__base + 'Log');
const WebSocketServer = require('websocket').server;


const TAG = 'SerialSimulator';

var instance = null;

module.exports = class SerialSimulator {
    constructor() {
        if (instance == null) {
            this.ws = new WebSocketServer();
        }
    }

    send(data) {
        this.ws.send("test");
    }
    
    onReceived() {
        
    }
}