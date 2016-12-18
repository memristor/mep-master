const WebSocket = require('ws').Server;
const OpenUrl = require('openurl');
const Path = require('path');


// Start servers

// WebServer web socket to the outside world
let wsWebServer = new WebSocket({port: 8081});
console.log('Web Socket Server started!');
wsWebServer.on('connection', (socket) => {
    console.log('New client connected!');
});

// Telemetry server, from the inside
let wsTelemetryServer = new WebSocket({port: 1234});
console.log('Telemetry Server started!');
wsTelemetryServer.on('connection', (socket) => {
    console.log('New Robot connected!');

    socket.on('message', (data) => {
        console.log('Telemetry Data:', data);
        wsWebServer.clients.forEach((client) => {
            if (client !== socket) {
                client.send({type: 'telemetry', data: data});
            }
        });
    });
});
wsTelemetryServer.on('error', (err) => {
    console.log('Telemetry Error: ', err);
});

// Open a simulator
OpenUrl.open('file://' + Path.join(__dirname, 'website', 'index.html'));
