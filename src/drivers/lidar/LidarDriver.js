'use strict';
/** @namespace drivers.lidar */

const EventEmitter = require('events').EventEmitter;
const Point = Mep.require('misc/Point');
const Polygon = Mep.require('misc/Polygon');

const TAG = 'LidarDriver';

/**
 * Provides an abstraction layer on top of lidar's firmware and algorithms to determine
 * robot's position and obstacles
 * @fires drivers.lidar.LidarDriver#obstacleDetected
 * @memberOf drivers.lidar
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class LidarDriver extends EventEmitter {
    constructor(name, config) {
        super();

        // Merge configs
        this.config = Object.assign({
            cid: 8000,
            tolerance: 400,
            volume: 230,
            angle: 270,
            inverted: true
        }, config);
        this.name = name;

        // Set reference to `this`
        this._onDataReceived = this._onDataReceived.bind(this);
        this._addPointToPolyGenerator = this._addPointToPolyGenerator.bind(this);
        this._calculateRobotsLocation = this._calculateRobotsLocation.bind(this);

        // Initialize communication driver
        this.communicator = null;
        if (this.config._communicator !== undefined) {
            // For testing purposes only (experiments)
            this.communicator = this.config._communicator;
        } else {
            this.communicator = Mep.DriverManager.getDriver(this.config['@dependencies'].communicator);
        }
        this.communicator.on('data_' + this.config.cid, this._onDataReceived);

        // Set state variable
        this._readings = {};
        this._poly = {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
            polyPointsCount: 0,
            previousPoint: null
        };
        this._enabled = true;

        // Set initial measurements
        for (let i = 0; i < 360; i++) {
            this._readings[i] = {
                distance: Infinity,
                time: (new Date).getTime()
            };
        }
    }

    /**
     * Enable lidar driver
     */
    enable() {
        this._enabled = true;
    }

    /**
     * Disable lidar driver
     */
    disable() {
        this._enabled = false;
    }


    _calculateRobotsLocation() {
        let precision = 0.9;

        // Novakovic's algorithm

        // Publish
        this.emit('positionChanged', this.config.name, new Point(0, 0), precision);
    }

    /**
     * Process a measurement and try to make an obstacle approximation.
     * It uses bounding box algorithm to make an approximation of the obstacle
     * @link https://en.wikipedia.org/wiki/Minimum_bounding_box
     * @param angle {Number} - Angle of the measurement
     * @param distance {Number} - Distance to the closest point at given angle
     * @private
     */
    _addPointToPolyGenerator(angle, distance) {
        let point = new Point(0, distance);
        point.rotateAroundZero(angle);

        if (this._poly.polyPointsCount === 0) {
            if (distance < 2000) {
                this._poly.maxX = point.getX();
                this._poly.minX = point.getX();
                this._poly.maxY = point.getY();
                this._poly.minY = point.getY();
                this._poly.polyPointsCount++;
            }
        }
        else if (point.getDistance(this._poly.previousPoint) < this.config.tolerance) {
            if (point.getX() > this._poly.maxX) this._poly.maxX = point.getX();
            if (point.getX() < this._poly.minX) this._poly.minX = point.getX();
            if (point.getY() > this._poly.maxY) this._poly.maxY = point.getY();
            if (point.getY() < this._poly.minY) this._poly.minY = point.getY();
            this._poly.polyPointsCount++;
        }
        else {
            if (this._poly.maxY - this._poly.minY < 400 && this._poly.maxX - this._poly.minX < 400) {
                let offsetX = (this.config.volume - (this._poly.maxX - this._poly.minX) / 2);
                let offsetY = (this.config.volume - (this._poly.maxY - this._poly.minY) / 2);
                let polyPoints = [
                    new Point(this._poly.minX - offsetX, this._poly.minY - offsetY),
                    new Point(this._poly.maxX + offsetX, this._poly.minY - offsetY),
                    new Point(this._poly.maxX + offsetX, this._poly.maxY + offsetY),
                    new Point(this._poly.minX - offsetX, this._poly.maxY + offsetY),
                ];
                let polygon = new Polygon(this.name, Mep.Config.get('obstacleMaxPeriod'), polyPoints);
                let poi = new Point((this._poly.minX + this._poly.maxX) / 2, (this._poly.minY + this._poly.maxY) / 2);

                /**
                 * Position changed event.
                 * @event drivers.lidar.LidarDriver#obstacleDetected
                 * @property {String} driverName - Unique name of a driver
                 * @property {misc.Point} poi - Point which is part of obstacle
                 * @property {misc.Polygon} polygon - Approximation of the obstacle
                 * @property {Boolean} detected - True if obstacle is detected
                 */
                this.emit('obstacleDetected',
                    this.name,
                    poi,
                    polygon,
                    true
                );
            }
            this._poly.polyPointsCount = 0;
        }

        this._poly.previousPoint = point;
    }

    /**
     * Process data from lidar
     * @param data {Buffer} - Buffer from lidar
     * @private
     */
    _onDataReceived(data) {
        if (data.length !== 4 || this._enabled === false) {
            console.log(TAG, data);
            return;
        }

        let angle = ((data.readUInt8(0) & 0xFF) << 8) | data.readUInt8(1);
        let distance = ((data.readUInt8(2) & 0xFF) << 8) | data.readUInt8(3);

        if (this.config.inverted === true) {
            angle *= -1;
        }
        let scaledAngle = ((360 + angle) + this.config.angle) % 360;
        this._readings[scaledAngle] = {
            distance: distance,
            time: (new Date).getTime()
        };

        // Try to generate polygons
        this._addPointToPolyGenerator(scaledAngle, distance);
    };


    getPosition() {
        throw Error('Not implemented yet');
    }

    getGroups() {
        return ['position', 'terrain'];
    }
}

module.exports = LidarDriver;