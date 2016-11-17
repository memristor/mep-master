const ROBOT_STEP = 2;
const ROBOT_PERIOD = 1;

class Robot {
    constructor(x, y, widht, height) {
        let robot = this;

        this.width = widht;
        this.height = height;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.angle = 0;

        this.visualScaleWidth = 1;
        this.visualScaleHeight = 1;

        // Default node properties
        this.node = document.createElement('div');
        this.node.style.backgroundColor = 'red';
        this.node.style.borderColor = 'black';
        this.node.style.borderWidth = '1px';
        this.node.style.borderStyle = 'solid';
        this.node.style.position = 'relative';
        this.node.style.boxShadow = '10px 0px 20px #000000';
        this.node.addEventListener('mousedown', () => { robot.onMouseDown(); });
        this.node.addEventListener('mousemove', (e) => { robot.onMouseMove(e); });
        this.node.addEventListener('mouseup', this.onMouseUp);


        // Default robot properties
        this.setDimensions(this.width, this.height);
        this.setPosition(this.x, this.y);
    }

    onMouseDown() {
        this.moveActive = true;
    }

    onMouseMove(e) {
        console.log(e);
    }

    onMouseUp() { }

    getNode() {
        return this.node;
    }

    moveToSimulatedPosition(x, y, direction) {
        this.moveToPosition(x + this.startX, y + this.startY, direction);
    }

    moveToPosition(x, y, direction) {
        let robot = this;

        let startX = this.x;
        let startY = this.y;
        let destinationX = x;
        let destinationY = y;

        let destinationAngle = Math.tan((destinationY - startY) / (destinationX - startX)) * (180 / Math.PI);

        let determineY = (tempX) => {
            return ((destinationY - startY) / (destinationX - startX)) * (tempX - startX) + startY;
        };

        let move = () => {
            setTimeout(() => {
                let newX = (robot.x < x) ? robot.x + ROBOT_STEP : robot.x - ROBOT_STEP;
                let newY = determineY(newX);

                robot.setPosition(newX, newY);

                ws.send(JSON.stringify({
                    'to': 'brain:big',
                    'event': 'positionChanged',
                    'params': {x: newX - robot.startX, y: newY - robot.startY}
                }));

                if (Math.abs(robot.x - x) > ROBOT_STEP || Math.abs(robot.y - y) > ROBOT_STEP) {
                    move();
                }
            }, ROBOT_PERIOD);
        };

        let rotate = () => {
            setTimeout(() => {
                robot.angle = (destinationAngle < robot.angle) ? robot.angle - 1 : robot.angle + 1;
                robot.setAngle(robot.angle);

                if (Math.abs(robot.angle - destinationAngle) < 2) {
                    move();
                } else {
                    rotate();
                }
            }, 30);
        };

        rotate();
    }

    setVisualScale(width, height) {
        this.visualScaleWidth = width;
        this.visualScaleHeight = height;

        this.setDimensions(this.width, this.height);
        this.setPosition(this.x, this.y);
    }

    setDimensions(width, height) {
        this.width = width;
        this.height = height;
        this.node.style.width = (width * this.visualScaleWidth) + 'px';
        this.node.style.height = (height * this.visualScaleHeight) + 'px';
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.node.style.left = (x * this.visualScaleWidth - this.width * this.visualScaleWidth / 2) + 'px';
        this.node.style.top = (y * this.visualScaleHeight - this.height * this.visualScaleHeight / 2) + 'px';
    }

    setSimulationPosition(x, y) {
        this.setPosition(this.startX + x, this.startY + y);
    }

    setAngle(angle) {
        this.angle = angle;
        this.node.style.transform = 'rotate(' + angle + 'deg)';
    }

    getSimulatedPosition(x, y) {
        return { x: x - this.startX, y: y - this.startY};
    }
}
