let wsTelemetry;

class App {
    constructor() {
        let app = this;
        this.onTelemetry.bind(this);

        wsTelemetry = new WebSocket("ws://127.0.0.1:8081");
        wsTelemetry.addEventListener('message', (e) => {
            app.onTelemetry(e);
        });
    }

    onTelemetry(e) {
        let data = JSON.parse(e.data);
        console.log('Telemetry message', data);
    }
}

window.addEventListener('load', () => {
    new App();
});



