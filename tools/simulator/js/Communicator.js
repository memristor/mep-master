class Communicator {
    constructor(to) {
        this.to = to;
        this.ws = new WebSocket("ws://127.0.0.1:8080");
    }

    sendEvent(event, params) {
        let communicator = this;

        this.ws.send(JSON.stringify({
            'to': 'brain:' + communicator.to,
            'event': event,
            'params': params
        }));
    }
}