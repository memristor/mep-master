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
    this._retryConnection = options.retryConnection || true;
    this._retryInterval = options.retryInterval || 3000;

    Writable.call(this, options);

    this.connect();
}

util.inherits(WebSocketStream, Writable);

WebSocketStream.prototype.connect = function () {
    let self = this;

    this._ws = new WebSocket(this._host);
    // create webSocket client
    this._connected = false;

    this._ws.on('open', function open() {
        console.log('telemetry server connected');
        self._connected = true;
    });

    this._ws.on('close', function (e) {
        console.log('Socket is closed. Reconnect will be attempted in ' + self._retryInterval + ' ms.', e.reason);
        self._connected = false;
        if (self._retryConnection === true) {
            setTimeout(function () {
                self.connect();
            }, self._retryInterval);
        }
    });

    this._ws.on('error', function (err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        self._ws.close();
        if (!self._connected) {
            if (self._retryConnection === true) {
                setTimeout(function () {
                    self.connect();
                }, self._retryInterval);
            }
        }
    });
};

WebSocketStream.prototype.sendMessage = function (message, callback) {
    let self = this;
    let jsonMessage = JSON.stringify(message);
    this._ws.send(jsonMessage, function (err) {
        if (err) {
            self.emit('error', err);
        }
        if (callback) {
            callback();
        }
    });
};

WebSocketStream.prototype.write = function (entry, encoding, callback) {
    let self = this;
    if (!self._connected) {
        // telemetry lost
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
        if (!output.message) {
            output.message = output.error.message;
        }
    }

    try {
        self.sendMessage(input, callback);
    } catch (e) {
        // we do not want to manage an error within a logger
    }
};

module.exports = WebSocketStream;
