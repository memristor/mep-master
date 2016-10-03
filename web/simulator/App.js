const TERRAIN_WIDTH = 3000;
const TERRAIN_HEIGHT = 2000;

var terrain;
var ws;
var smallRobot;
var bigRobot;

window.addEventListener('load', Init);
function Init() {
    console.log('Init');

    terrain = new Terrain(document.getElementById('terrain'));


    bigRobot = new Robot(150, 760, 270, 270);
    terrain.addRobot(bigRobot);


    ws = new WebSocket("ws://127.0.0.1:8080");
    ws.onmessage = function (e) {
        var command = JSON.parse(e.data);
        console.log(command);

        switch (command.params.func) {
            case 'constructor':
                bigRobot.setPosition(command.params.x, command.params.y);
                break;

            case 'moveToPosition':
                bigRobot.moveToPosition(command.params.x, command.params.y);
                break;
        }
    }
}



