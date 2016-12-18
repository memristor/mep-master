const Writable = require('stream').Writable;
const util = require('util');
const moment = require('moment');
const _ = require('lodash');
const WebSocket = require('ws');

const levels = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal'
};


function WebSocketStream(options) {
    options = options || {};
    this._host = options.host || 'ws://127.0.0.1:1234';

    // create webSocket client
    this._ws = new WebSocket(this._host);
    this._connected = false;
    let self = this;

    this._ws.on('open', function open() {
        console.log('telemetry server connected');
        self._connected = true;
    });

    Writable.call(this, options);
}

util.inherits(WebSocketStream, Writable);

WebSocketStream.prototype._write = function (entry, encoding, callback) {
    console.log('telemetry data', self._connected);
    if (!self._connected) {
        // telemetry lost
        console.log('telemetry data Lost');
        return;
    }

    let input = JSON.parse(entry.toString('utf8'));

    let output = {
        'date': input.time,
        'level_int': input.level,
        'level': levels[input.level],
        'message': input.msg
    };

    // merge
    output = _.defaults(output, input);

    delete output.msg;
    delete output.v;
    delete output.time;

    if (input.err) {
        output.error = input.err;
        if (!output.message) output.message = output.error.message;
    }

    if (this._writeCallback) {
        this._writeCallback(output, input);
    }

    let self = this;
    this._ws.send(input, function (err) {
        if (err) {
            self.emit('error', err);
        }
        callback();
    });

};

module.exports = WebSocketStream;
