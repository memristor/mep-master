const Robot = require('bindings')('Robot').Robot;
const EventEmiter = require('events');
const Util = require('util');

Util.inherits(Robot, EventEmiter);


function nsToMs(ns) {
    let us = ns / 1000000;
    let ms = ns / 1000000000;
    return ` ${ns} ns\t\t${us} us\t\t${ms} ms`;
}

function timeDiffNsToMs(timeDiff, timeGettingTime) {
    return nsToMs(timeDiff[0] * 1e9 + timeDiff[1] - timeGettingTime);
}
// [ 1800216, 25 ]
// get relative time to take time
let echantillon = 100;
let totalGettingTime = 0.0;
for (let i = 0; i < echantillon; i++) {
    let time1 = process.hrtime();
    let time2 = process.hrtime(time1);
    totalGettingTime += time2[0] * 1e9 + time2[1];
}
let oneTimeGettingTime = totalGettingTime / echantillon;

let time = process.hrtime();
let robot = new Robot();
let creationTime = process.hrtime(time);
let positionChangeTime;

robot.on('positionChanged', function (e) {
    positionChangeTime = process.hrtime(setXRobotStartTime);
    console.log('positionChanged() ' + e);
    console.log(`Benchmark positionChanged took ${positionChangeTime[0] * 1e9 + positionChangeTime[1]} nanoseconds`);
});

let setXRobotStartTime = process.hrtime();
robot.setX(3);
let setXRobotEndTime = process.hrtime(setXRobotStartTime);

let loopGetPosition = 10000000;
let loopGetResults = 0.0;
let firstTimeGetXRobotEndTime;
for (let i = 0; i < loopGetPosition; i++) {
    let getXRobotStartTime = process.hrtime();
    let position = robot.getX();
    let getXRobotEndTime = process.hrtime(getXRobotStartTime);
    if (i < 1) {
        firstTimeGetXRobotEndTime = getXRobotEndTime;
    }
    loopGetResults += getXRobotEndTime[0] * 1e9 + getXRobotEndTime[1];
}
// Compute average :
// loopGetResults

let time2 = process.hrtime();
let robot2 = new Robot();
let creationTime2 = process.hrtime(time2);


let getXRobot2StartTime = process.hrtime();
let position2 = robot2.getX();
let getXRobot2EndTime = process.hrtime(getXRobot2StartTime);
console.log(position2);
oneTimeGettingTime=0;
console.log(`Benchmark took :
    Getting time ${echantillon} times : ${nsToMs(totalGettingTime)}
    Getting time 1 time : ${nsToMs(totalGettingTime / echantillon)}
        Creating Robot           :  ${timeDiffNsToMs(creationTime, oneTimeGettingTime)}
        Creating Robot 2         :  ${timeDiffNsToMs(creationTime, oneTimeGettingTime)}
        Setting position Robot   :  ${timeDiffNsToMs(setXRobotEndTime, oneTimeGettingTime)}
        Setting vs pos. changed  :  ${timeDiffNsToMs(positionChangeTime, oneTimeGettingTime)}
        Getting position 1st time:  ${timeDiffNsToMs(firstTimeGetXRobotEndTime, oneTimeGettingTime)}
        Getting position Robot 2 :  ${timeDiffNsToMs(getXRobot2EndTime, oneTimeGettingTime)}
        Getting position ${loopGetPosition} times : ${nsToMs(loopGetResults - oneTimeGettingTime * loopGetPosition)}
        Getting position 1 time : ${nsToMs((loopGetResults - oneTimeGettingTime * loopGetPosition) / loopGetPosition)}
`);

