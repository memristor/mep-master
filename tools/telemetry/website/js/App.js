let bigRobot;
let ws;

class App {
    constructor() {
        let app = this;
        this.onCommand.bind(this);

        ws = new WebSocket("ws://127.0.0.1:8080");

        let terrainConfig = new TerrainConfig();
        let terrain = new Terrain(terrainConfig, document.getElementById('terrain'));
        bigRobot = new Robot('big', terrainConfig, -1300, 0, 230, 230);
        terrain.addRobot(bigRobot);

        document.getElementById('btn-rotate').addEventListener('click', () => {
            terrain.rotate();
        });


        document.getElementById('terrain').addEventListener('mousemove', () => {
            document.getElementById('cursorPosition').innerHTML =
                JSON.stringify(terrain.getCursorPosition());
        });

        ws.addEventListener('message', (e) => { app.onCommand(e); });
    }

    onCommand(e) {
        let data = JSON.parse(e.data);

        switch (data.command) {
            case 'init':
                bigRobot.setPosition(data.params.x, data.params.y);
                break;

            case 'moveToPosition':
                bigRobot.moveToPosition(data.params.x, data.params.y);
                break;
        }
    }
}

window.addEventListener('load', () => { new App(); });



