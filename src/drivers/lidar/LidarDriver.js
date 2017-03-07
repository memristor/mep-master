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
            tolerance: 100,
            volume: 70
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
        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;
        let polyPointsCount = 0;
        let previousDistance = 0;

        for (let angle in this._readings) {
            if (time - this._readings[angle].time < this.config.eventPeriod) {
                if (this._readings[angle].distance < 2000) {
                    let point = new Point(0, this._readings[angle].distance);
                    point.rotate(new Point(0, 0), angle);

                    if (polyPointsCount === 0) {
                        maxX = point.getX();
                        minX = point.getX();
                        maxY = point.getY();
                        minY = point.getY();
                        polyPointsCount++;
                    }
                    else if (Math.abs(previousDistance - this._readings[angle].distance) < this.config.tolerance) {
                        if (point.getX() > maxX) maxX = point.getX();
                        if (point.getX() < minX) minX = point.getX();
                        if (point.getY() > maxY) maxY = point.getY();
                        if (point.getY() < minY) minY = point.getY();
                        polyPointsCount++;
                    }
                    else {
                        if (polyPointsCount < 0 || Math.abs(minY - maxY) > 500) {
                            //console.log(points[i - 1], points[i], points[i].getDistance(points[i - 1]));
                        } else {
                            let polyPoints = [
                                new Point(minX - this.config.volume, minY - this.config.volume),
                                new Point(maxX + this.config.volume, minY - this.config.volume),
                                new Point(maxX + this.config.volume, maxY + this.config.volume),
                                new Point(minX - this.config.volume, maxY + this.config.volume),
                            ];
                            let polygon = new Polygon(this.name, this.config.eventPeriod, polyPoints);

                            this.emit('obstacleDetected',
                                this.name,
                                polyPoints[0],
                                polygon,
                                true
                            );
                        }
                        polyPointsCount = 0;
                    }

                    previousDistance = this._readings[angle].distance;
                }
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

        let scaledAngle = (-angle + 90) % 360;
        this._readings[scaledAngle] = {
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