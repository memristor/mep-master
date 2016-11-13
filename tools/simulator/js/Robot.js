const ROBOT_STEP = 2;
const ROBOT_PERIOD = 1;

class Robot {
    constructor(x, y, widht, height) {
        this.width = widht;
        this.height = height;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;

        this.visualScaleWidth = 1;
        this.visualScaleHeight = 1;

        // Default node properties
        this.node = document.createElement('div');
        this.node.style.backgroundColor = 'red';
        this.node.style.borderColor = 'black';
        this.node.style.borderWidth = '1px';
        this.node.style.borderStyle = 'solid';
        this.node.style.position = 'relative';
        this.node.addEventListener('mousedown', this.onMouseDown);
        this.node.addEventListener('mousemove', this.onMouseMove);
        this.node.addEventListener('mouseup', this.onMouseUp);

        //this.moveActive = false;
        //this.onMouseDown.bind(this);
        //this.onMouseMove.bind(this);
        //this.onMouseUp.bind(this);

        // Default robot properties
        this.setDimensions(this.width, this.height);
        this.setPosition(this.x, this.y);
    }

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

        move();
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
}
