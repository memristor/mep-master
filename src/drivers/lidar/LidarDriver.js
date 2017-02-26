'use strict';

const EventEmitter = require('events').EventEmitter;
const simplify = require('simplify-js');

const TAG = 'LidarDriver';

class LidarDriver extends EventEmitter {
    constructor(name, config) {
        super();

        this.config = Object.assign({
            id: 1000,
            eventPeriod: 1000,
            tolerance: 5
        }, config);
        this.name = name;

        this._onDataReceived = this._onDataReceived.bind(this);
        this._generatePolygons = this._generatePolygons.bind(this);
        this._calculateRobotsLocation = this._calculateRobotsLocation.bind(this);

        this.communicator = null;
        if (this.config._communicator !== undefined) {
            // For testing purposes only (experiments)
            this.communicator = this.config._communicator;
        } else {
            this.communicator = Mep.DriverManager.getDriver(this.config['@dependencies'].communicator);
        }
        this.communicator.on('data_' + this.config.canId, this._onDataReceived);

        this._readings = {};

        // Start generating polygons
        if (this.config.eventPeriod > 0) {
            setTimeout(this._generatePolygons, this.config.eventPeriod);
        }
    }

    // Run this when robot stop
    _calculateRobotsLocation() {
        let precision = 0.9;

        // Novakovic's algorithm

        // Publish
        this.emit('positionChanged', this.config.name, new Point(0, 0), precision);
    }

    _generatePolygons() {
        let time = new Date();
        let points = [];
        for (let angle in this._readings) {
            if (time - this._readings[angle].time < this.config.eventPeriod) {
                // points.push();
            } else {
                delete this._readings[angle];
            }
        }

        // let polygon = new Polygon(this.name, this.config.duration, point);
        // this.emit('obstacleDetected', this.name, this.poi, polygon, true);

        // simplify(points, this.config.tolerance);

        setTimeout(this._generatePolygons, this.config.eventPeriod);
    }

    _onDataReceived(data) {
        if (data.length !== 8) {
            Mep.Log.error(TAG, 'Error receiving data');
            return;
        }

        let quality = data.readUint8(0) & 0x80;
        let angle = ((data.readUint8(0) & 0x7F) << 8) | data.readUint8(1);
        let length = ((data.readUint8(2) & 0xFF) << 8) | data.readUint8(3);

        this._readings[angle] = {
            quality: quality,
            length: length,
            time: new Date()
        };
    };


    getPosition() {

    }

    getGroups() {
        return ['position', 'terrain'];
    }
}

module.exports = LidarDriver;