const ROBOT_REFRESH_PERIOD = 1;
const ROBOT_ROTATION_CORRECTIVE_FACTOR = 0.01;
const ROBOT_MOVE_CORRECTIVE_FACTOR = 0.01;
const ROBOT_MOVE_TOLERANCE = 2;

class Robot {
    constructor(terrainConfig, x, y, width, height) {
        let robot = this;

        this.width = width;
        this.height = height;

        this.terrainConfig = terrainConfig;
        this.controller = new Controller({
            k_p: 0.25,
            k_i: 0.01,
            k_d: 0.01,
            dt: 1
        });

        // Default node properties
        this.node = document.createElement('div');
        this.node.style.backgroundColor = 'red';
        this.node.style.borderColor = 'black';
        this.node.style.borderWidth = '1px';
        this.node.style.borderStyle = 'solid';
        this.node.style.borderTopWidth = '5px';
        this.node.style.position = 'relative';
        this.node.style.boxShadow = '10px 0px 20px #000000';

        this.moveStep = 0;
        this.angleStep = 0;
        this.speed = 0;
        this.currentSpeed = 0;
        this.speedMultiplier = 1;
        this.setSpeed(100);

        this.position = new Point(x, y);
        this.angle = 0;
        this.setAngle(90);

        // Default robot properties
        this.setDimensions(this.width, this.height);
        this.setPosition(new Point(x, y));
    }

    getNode() {
        return this.node;
    }

    setSpeed(speed) {
        this.speed = speed;
        this.moveStep = this.speed * this.speedMultiplier * ROBOT_MOVE_CORRECTIVE_FACTOR;
        this.angleStep = this.speed * this.speedMultiplier * ROBOT_ROTATION_CORRECTIVE_FACTOR;
    }

    setSpeedMultiplier(speedMultiplier) {
        this.speedMultiplier = speedMultiplier;

        // Refresh
        this.setSpeed(this.speed);
    }

    moveToPosition(x, y, direction) {
        let robot = this;

        let startPoint = new Point(this.position.x, this.position.y);
        let destinationPoint = new Point(x, y);
        this.controller.setTarget(startPoint.getDistance(destinationPoint));

        let destinationAngle = Math.round(Math.atan2(
                (destinationPoint.getY() - startPoint.getY()),
                (destinationPoint.getX() - startPoint.getX())
            ) * (180 / Math.PI));

        let moveStepSizeX = this.moveStep * Math.abs(Math.cos(destinationAngle * (Math.PI / 180)));

        let determineY = (tempX) => {
            return ((destinationPoint.getY() - startPoint.getY()) /
                (destinationPoint.getX() - startPoint.getX())) * (tempX - startPoint.getX()) + startPoint.getY();
        };

        let move = () => {
            setTimeout(() => {
                let newX = (robot.position.getX() < x) ?
                    robot.position.getX() + moveStepSizeX :
                    robot.position.getX() - moveStepSizeX;

                let newPoint = new Point(newX, determineY(newX));

                robot.setPosition(newPoint);

                ws.send(JSON.stringify({
                    'to': 'brain:big',
                    'event': 'positionChanged',
                    'params': { x: newPoint.getX(), y: newPoint.getY() }
                }));

                if (robot.position.getDistance(new Point(x, y)) > ROBOT_MOVE_TOLERANCE) {
                    move();
                }

            }, ROBOT_REFRESH_PERIOD);
        };

        let rotate = () => {
            setTimeout(() => {
                if (destinationAngle < robot.angle) {
                    robot.setAngle(robot.angle - robot.angleStep);
                } else {
                    robot.setAngle(robot.angle + robot.angleStep);
                }

                if (Math.abs(robot.angle - destinationAngle) <= robot.angleStep) {
                    move();
                } else {
                    rotate();
                }
            }, ROBOT_REFRESH_PERIOD);
        };

        rotate();
    }

    setDimensions(width, height) {
        this.width = width;
        this.height = height;
        this.node.style.width = (width * this.terrainConfig.scaleFactorWidth) + 'px';
        this.node.style.height = (height * this.terrainConfig.scaleFactorHeight) + 'px';
    }

    setPosition(point) {
        this.position = point;

        // Visual
        let centralizedPoint = new Point(
            point.getX() - this.height / 2,
            point.getY() + this.width / 2
        );
        let coordinates = centralizedPoint.exportWindowCoordinates(this.terrainConfig);

        this.node.style.left = coordinates.x + 'px';
        this.node.style.top = coordinates.y + 'px';
    }

    getPosition() {
        return this.position;
    }

    setAngle(angle) {
        this.angle = angle;
        this.node.style.transform = 'rotate(' + (90 - angle) + 'deg)';
    }
}
