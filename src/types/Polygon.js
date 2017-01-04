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

    translate(translatePoint) {
        for (let point of this.points) {
            point.setX(point.getX() + translatePoint.getX());
            point.setY(point.getY() + translatePoint.getY());
        }
    }

    rotate(originPoint, angle) {
        for (let point of this.points) {
            let x = Math.cos(angle) * (point.getX() - originPoint.getX()) - Math.sin(angle) * (point.getY() - originPoint.getY()) + originPoint.getX();
            let y = Math.sin(angle) * (point.getX() - originPoint.getX()) + Math.cos(angle) * (point.getY() - originPoint.getY()) + originPoint.getY();
            point.setX(x);
            point.setY(y);
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

    clone() {
        let points = [];
        for (let point of this.points) {
            points.push(point.clone());
        }
        return new Polygon(this.tag, this.duration, points);
    }
}

module.exports = Polygon;