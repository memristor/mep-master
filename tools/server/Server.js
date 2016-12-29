const RobotServer = require('./CoreServer.js');
const DashboardServer = require('./DashServer');

/**
 * Packet format
 * <pre>
 * {
 *    from: 'core:big',
 *    to: 'dash:big',
 *    tag: 'MotionDriver',
 *    data: '2016-12-24T16:10:04.133Z',
 *    action: 'PositionChanged',
 *    params: {
 *      x: 10,
 *      y: 20
 *    }
 * }
 * </pre>
 */
class Server {
    constructor() {
        let robotServer = new RobotServer();
        let dashboardServer = new DashboardServer();

        robotServer.on('packet', (packet) => {
            //console.log(packet);
            dashboardServer.send(packet);
        });

        dashboardServer.on('packet', (packet) => {
            //console.log(packet);
            robotServer.send(packet);
        });
    }
}

new Server();
