class Misc {
    static isAngleInRange(from, to, angle) {
        from = from % 360;
        to = to % 360;

        if (from > to) {
            return ((angle > from) || ( angle < to))
        } else if (to > from) {
            return ((angle < to) && ( angle > from))
        } else {
            return (angle === to)
        }
    }
}

module.exports = Misc;