const ROBOT_STEP = 2;
const ROBOT_PERIOD = 1;

function Robot(x, y, widht, height) {
    this.width = widht;
    this.height = height;
    this.x = x;
    this.y = y;

    this.visualScaleWidth = 1;
    this.visualScaleHeight = 1;

    // Default node properties
    this.node = document.createElement('div');
    this.node.style.backgroundColor = 'red'
    this.node.style.borderColor = 'black';
    this.node.style.borderWidth = '1px';
    this.node.style.borderStyle = 'solid';
    this.node.style.position = 'relative';
    this.node.addEventListener('mousedown', this.onMouseDown);
    this.node.addEventListener('mousemove', this.onMouseMove);
    this.node.addEventListener('mouseup', this.onMouseUp);

    this.moveActive = false;
    this.onMouseDown.bind(this);
    this.onMouseMove.bind(this);
    this.onMouseUp.bind(this);

    // Default robot properties
    this.setDimensions(this.width, this.height);
    this.setPosition(this.x, this.y);
}

Robot.prototype.onMouseDown = function (e) {
    this.moveActive = true;
}

Robot.prototype.onMouseMove = function (e) {
    if (this.moveActive == true) {
        this.node.style.left = e.clientX;
    }
}

Robot.prototype.onMouseUp = function (e) {
    this.moveActive = false;
}

Robot.prototype.getNode = function () {
    return this.node;
}

Robot.prototype.moveToPosition = function (x, y, direction) {
    var that = this;

    var move = function () {
        setTimeout(function () {
            var newX = that.x;
            var newY = that.y;

            if (that.x < x) {
                newX = that.x + ROBOT_STEP
            } else if (that.x > x) {
                newX = that.x - ROBOT_STEP
            }

            if (that.y < y) {
                newY = that.y + ROBOT_STEP
            } else if (that.y > y) {
                newY = that.y - ROBOT_STEP
            }

            that.setPosition(newX, newY);

            if (Math.abs(that.x - x) >= ROBOT_STEP || Math.abs(that.y - y) >= ROBOT_STEP) {
                move();
            }
        }, ROBOT_PERIOD);
    }

    move();
}

Robot.prototype.setVisualScale = function (width, height) {
    this.visualScaleWidth = width;
    this.visualScaleHeight = height;

    this.setDimensions(this.width, this.height);
    this.setPosition(this.x, this.y);
}

Robot.prototype.setDimensions = function (width, height) {
    this.width = width;
    this.height = height;
    this.node.style.width = (width * this.visualScaleWidth) + 'px';
    this.node.style.height = (height * this.visualScaleHeight) + 'px';
}

Robot.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
    this.node.style.left = (x * this.visualScaleWidth - this.width * this.visualScaleWidth / 2) + 'px';
    this.node.style.top = (y * this.visualScaleHeight - this.height * this.visualScaleHeight / 2) + 'px';
}