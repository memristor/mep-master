const WebSocket = require('ws').Server;

// Start server
let wss = new WebSocket({ port: 8080 });
console.log('Server started!');

// Do duty
wss.on('connection', (socket) => {
    console.log('New client is connected!');

    socket.on('message', (data) => {
        console.log('Data:', data);
        wss.clients.forEach((client) => {
            if (client !== socket) client.send(data);
        });
    });
});

// Handle error
wss.on('error', (err) => {
    console.log('Error: ', err);
});