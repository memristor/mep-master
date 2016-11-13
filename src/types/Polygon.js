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
        this.pfId = null;
    }

    /**
     * Get specific ID for path finding algorithm
     * @returns {Number} - ID for path finding algorithm
     */
    getPfId() {
        return this.pfId;
    }

    /**
     * Set specific ID for path finding algorithm
     * @param pfId - Specific ID for path finding algorithm
     */
    setPfId(pfId) {
        this.pfId = pfId;
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