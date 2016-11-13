class Polygon {
    constructor(source, duration, points) {
        // Check points
        if (points.length < 3) {
            let msg = 'Polygon require at least 3 points';
            Mep.Log.error(TAG, msg);
            throw Error(msg);
        }

        // Store values
        this.duration = duration;
        this.source = source;
        this.points = points;
        this.id = null;
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

    getSource() {
        return this.source;
    }
}

module.exports = Polygon;