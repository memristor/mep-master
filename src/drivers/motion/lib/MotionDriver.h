/*
 * KretackiDrajver.h
 *
 *  Created on: Nov 7, 2013
 *      Author: LaptopX
 */

#ifndef KRETACKIDRAJVER_H_
#define KRETACKIDRAJVER_H_

#include <thread>
#include <mutex>
#include <sstream>
#include <iostream>
#include <string>
#include "UartConnection.h"
#include "Point2D.h"

namespace motion
{

using namespace std;

class MotionDriver {
public:
	enum State { IDLE = 1, STUCK = 2, MOVING = 3, ROTATING = 4, ERROR = 5};
	enum MovingDirection { FORWARD = 1, BACKWARD = -1 };

private:
	geometry::Point2D position;
	int orientation;
	State state;
	char speed;
	MovingDirection direction;

    uart::UartConnection uart;

	int convertToInt(char msb, char lsb);
	
	mutex *io_mutex;

public:
	MotionDriver(geometry::Point2D initPosition=geometry::Point2D(), int initOrientation=0, int initSpeed=100);
	~MotionDriver();
	
	void moveStraight(int distance);
	void rotateFor(int relativeAngle);
	void rotateTo(int absoluteAngle);
	void moveToPosition(geometry::Point2D position, MovingDirection direction);
	void moveArc(geometry::Point2D center, int angle, MovingDirection direction);
	void stop();
    void softStop();
    void finishCommand();

	char getSpeed();
	geometry::Point2D getPosition();
	int getOrientation();
	State getState();
	int getDirection();

	void setSpeed(unsigned char speed);
	void setPositionAndOrientation(const geometry::Point2D position, int orientation=0);

	void refreshData();
};

}

#endif /* KRETACKIDRAJVER_H_ */
