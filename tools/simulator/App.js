const TERRAIN_WIDTH = 3000;
const TERRAIN_HEIGHT = 2000;

var terrain;
var ws;
var smallRobot;
var bigRobot;


class App {
    constructor() {
        let app = this;
        this.onCommand.bind(this);

        ws = new WebSocket("ws://127.0.0.1:8080");

        terrain = new Terrain(document.getElementById('terrain'));
        bigRobot = new Robot(150, 760, 230, 230);
        terrain.addRobot(bigRobot);

        ws.addEventListener('message', (e) => { app.onCommand(e); });
    }

    onCommand(e) {
        let data = JSON.parse(e.data);

        switch (data.command) {
            case 'init':
                bigRobot.setSimulationPosition(data.params.x, data.params.y);
                break;

            case 'moveToPosition':
                bigRobot.moveToSimulatedPosition(data.params.x, data.params.y);
                break;
        }
    }
}

window.addEventListener('load', () => { new App(); });



