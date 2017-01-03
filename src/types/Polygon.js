class Polygon {
    constructor(tag, duration, points) {
        // Check points
        if (points.length < 3) {
            let msg = 'Polygon requires at least 3 points';
            Mep.Log.error(TAG, msg);
            throw Error(msg);
        }

        // Store values
        this.duration = duration;
        this.tag = tag;
        this.points = points;
        this.id = null;
    }

    translate(x, y) {
        for (let point of this.points) {
            point.setX(point.getX() + x);
            point.setY(point.getY() + y);
        }
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
    }

    getPoints() {
        return this.points;
    }


    getDuration() {
        return this.duration;
    }

    getTag() {
        return this.tag;
    }
}

module.exports = Polygon;