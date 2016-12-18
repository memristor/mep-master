const ROBOT_REFRESH_PERIOD = 1;
const ROBOT_ROTATION_CORRECTIVE_FACTOR = 0.01;
const ROBOT_MOVE_CORRECTIVE_FACTOR = 0.03;
const ROBOT_MOVE_TOLERANCE = 3;

class Robot {
    constructor(name, terrainConfig, x, y, width, height) {
        this.communicator = new Communicator(name);

        this.width = width;
        this.height = height;

        this.terrainConfig = terrainConfig;

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

        let destinationAngle = Math.round(Math.atan2(
                (destinationPoint.getY() - startPoint.getY()),
                (destinationPoint.getX() - startPoint.getX())
            ) * (180 / Math.PI)) + 90;

        let moveStepSizeX = this.moveStep * Math.abs(Math.cos((destinationAngle - 90) * (Math.PI / 180)));

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

                robot.communicator.sendEvent('positionChanged', {
                    x: newPoint.getX(),
                    y: newPoint.getY()
                });

                if (robot.position.getDistance(new Point(x, y)) > ROBOT_MOVE_TOLERANCE) {
                    move();
                } else {
                    robot.communicator.sendEvent('stateChanged', { state: 1 });
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
                    robot.communicator.sendEvent('stateChanged', { state: 3 });
                } else {
                    rotate();
                }
            }, ROBOT_REFRESH_PERIOD);
        };

        rotate();
        robot.communicator.sendEvent('stateChanged', { state: 4 });
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
            point.getX() + this.width / 2,
            point.getY() - this.height / 2
        );
        let coordinates = centralizedPoint.exportWindowCoordinates(this.terrainConfig);

        this.node.style.left = coordinates.y + 'px';
        this.node.style.top = coordinates.x + 'px';
    }

    getPosition() {
        return this.position;
    }

    setAngle(angle) {
        this.angle = angle;
        this.node.style.transform = 'rotate(' + (angle - 90) + 'deg)';
    }
}
