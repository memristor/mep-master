class Point {
    constructor(x, y, tag) {
        this.x = x;
        this.y = y;
        this.tag = tag;
    }

    getX() { return this.x; }
    getY() { return this.y; }
    getTag() { return this.tag; }
}

module.exports = Point;