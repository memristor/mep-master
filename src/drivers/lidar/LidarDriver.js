'use strict';

const EventEmitter = require('events').EventEmitter;
const simplify = require('simplify-js');
const Point = Mep.require('misc/Point');
const Polygon = Mep.require('misc/Polygon');

const TAG = 'LidarDriver';

class LidarDriver extends EventEmitter {
    constructor(name, config) {
        super();

        this.config = Object.assign({
            cid: 8000,
            eventPeriod: 1000,
            tolerance: 60
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
        this.communicator.on('data_' + this.config.cid, this._onDataReceived);

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
        let time = (new Date).getTime();
        let points = [];
        for (let angle in this._readings) {
            if (time - this._readings[angle].time < this.config.eventPeriod) {
                let point = new Point(0, this._readings[angle].distance);
                point.rotate(new Point(0, 0), angle);
                points.push(point);
            }
        }

        if (points.length > 0) {
            points = simplify(points, this.config.tolerance);
            //console.log(points);

            let polyPoints = [];
            for (let i = 0; i < points.length; i++) {
                if (i % 6 === 0 && i !== 0) {
                    let polygon = new Polygon(this.name, this.config.eventPeriod, polyPoints);
                    this.emit('obstacleDetected', this.name, polyPoints[0], polygon, true);
                    polyPoints = [];

                    console.log(polygon);
                }
                polyPoints.push(points[i]);
            }
        }


        setTimeout(this._generatePolygons, this.config.eventPeriod);
    }

    _onDataReceived(data) {
        if (data.length !== 4) {
            return;
        }

        let angle = ((data.readUInt8(0) & 0xFF) << 8) | data.readUInt8(1);
        let distance = ((data.readUInt8(2) & 0xFF) << 8) | data.readUInt8(3);

        this._readings[angle] = {
            distance: distance,
            time: (new Date).getTime()
        };
    };


    getPosition() {

    }

    getGroups() {
        return ['position', 'terrain'];
    }
}

module.exports = LidarDriver;