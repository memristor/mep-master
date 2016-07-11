/*
 * KretackiDrajver.cpp
 *
 *  Created on: Nov 7, 2013
 *      Author: LaptopX
 */

#include "MotionDriver.h"
#include <stdio.h>

namespace motion
{

MotionDriver::MotionDriver(geometry::Point2D initPosition, RobotType robotType, int initOrientation, int initSpeed):
    io_mutex(new mutex())
{
	setPositionAndOrientation(initPosition, initOrientation);
	setSpeed(initSpeed);
	direction = FORWARD;
	state = IDLE;

	reverseAngle = robotType;
}

MotionDriver::~MotionDriver()
{
	delete io_mutex;
}

void MotionDriver::moveStraight(int distance)
{
    std::stringstream ss;
    ss<<"Move strait: "<<distance;
    debug(ss.str());
	lock_guard<mutex> lock(*io_mutex);
	
	char message[] = {
			'D',
			(char)(distance>>8),
			(char)(distance),
			0 // krajnja brzina (za sada fiksirana na 0)
	};

	uart.writeUart(message, 4);
	if(distance >= 0) this->direction = FORWARD;
	else this->direction = BACKWARD;
}

void MotionDriver::rotateFor(int relativeAngle)
{
    std::stringstream ss;
    ss<<"Rotate for: "<<(int)relativeAngle;
    debug(ss.str());
	lock_guard<mutex> lock(*io_mutex);
	
	char message[] = {
			'T',
			(char)(reverseAngle*relativeAngle>>8),
			(char)(reverseAngle*relativeAngle)
	};

	uart.writeUart(message, 3);
}

void MotionDriver::rotateTo(int absoluteAngle)
{
    std::stringstream ss;
    ss<<"Rotate to: "<<(int)absoluteAngle;
    debug(ss.str());
	lock_guard<mutex> lock(*io_mutex);
	
	char message[] = {
			'A',
			(char)(reverseAngle*absoluteAngle>>8),
			(char)(reverseAngle*absoluteAngle)
	};

	uart.writeUart(message, 3);
}

void MotionDriver::moveToPosition(geometry::Point2D position, MovingDirection direction)
{   
    std::stringstream ss;
    ss<<"Move to position: "<<position;
    debug(ss.str());
	lock_guard<mutex> lock(*io_mutex);
	
	char message[] = {
			'G',
			(char)(position.getX()>>8),
			(char)(position.getX()),
			(char)(reverseAngle*position.getY()>>8),
			(char)(reverseAngle*position.getY()),
			0, // krajnja brzina (za sada fiksirana na 0)
			direction
	};

	uart.writeUart(message, 7);
	this->direction = direction;
}

void MotionDriver::moveArc(geometry::Point2D center, int angle, MovingDirection direction)
{
	lock_guard<mutex> lock(*io_mutex);

	char message[] = {
			'Q',
			(char)(center.getX()>>8),
			(char)(center.getX()),
			(char)(reverseAngle*center.getY()>>8),
			(char)(reverseAngle*center.getY()),
			(char)(reverseAngle*angle>>8),
			(char)(reverseAngle*angle),
			direction
	};

	uart.writeUart(message, 8);
	this->direction = direction;
}

void MotionDriver::stop()
{
    debug("Stop command received");
	lock_guard<mutex> lock(*io_mutex);

	uart.writeUart('S');
}

void MotionDriver::softStop(){
    debug("Soft stop");
    lock_guard<mutex> lock(*io_mutex);

    uart.writeUart('s');
}

char MotionDriver::getSpeed()
{
	return speed;
}

geometry::Point2D MotionDriver::getPosition()
{
	return position;
}

int MotionDriver::getOrientation()
{
	return orientation;
}

MotionDriver::State MotionDriver::getState()
{
        return state;
}

int MotionDriver::getDirection()
{
	return direction;
}

void MotionDriver::setSpeed(unsigned char speed)
{
    unsigned char newSpeed=0;

    std::stringstream ss;
    ss<<"Set speed "<<(int)speed;
    debug(ss.str());
    lock_guard<mutex> lock(*io_mutex);

    uart.flushOutput();
    uart.flushInput();

	this->speed = speed;

	char message[] = {
			'V',
			speed
	};
	uart.writeUart(message, 2);
    uart.readAll(&newSpeed, 1);

    if (newSpeed!=speed){
        error("Speed is not set!!");
    }
    printf("--Received speed: %c %hex: X\n", newSpeed);
}

void MotionDriver::setPositionAndOrientation(const geometry::Point2D position, int orientation)
{
    debug("Set position and orientation");
	lock_guard<mutex> lock(*io_mutex);

	this->position = position;
	this->orientation = orientation;

	char message[] = {
			'I',
			(char)(position.getX()>>8),
			(char)(position.getX()),
			(char)(reverseAngle*position.getY()>>8),
			(char)(reverseAngle*position.getY()),
			(char)(reverseAngle*orientation>>8),
			(char)(reverseAngle*orientation)
	};

	uart.writeUart(message, 7);
}

void MotionDriver::refreshData()
{
	lock_guard<mutex> lock(*io_mutex);

	uart.flushOutput();
	uart.flushInput();

	char receiveBuffer[7] = {0,0,5,0,5,0,5};
	uart.writeUart('P');
	uart.readAll(receiveBuffer, 7);

	switch(receiveBuffer[0])
	{
	case 'I':
	{
		state = IDLE;
		break;
	}
	case 'M':
	{
		state = MOVING;
        break;
	}
	case 'R':
	{
		state = ROTATING;
		break;
	}
	case 'S':
	{
		state = STUCK;
		break;
	}
	case 'E':
	{
		state = ERROR;
		break;
	}
	}

	position.setX( convertToInt(receiveBuffer[1], receiveBuffer[2]) );
	position.setY( reverseAngle*convertToInt(receiveBuffer[3], receiveBuffer[4]) );
	orientation = reverseAngle*convertToInt(receiveBuffer[5], receiveBuffer[6]);
}

int MotionDriver::convertToInt(char msb, char lsb)
{
    return (short)( (msb<<8) | (lsb & 0xFF) );
}

}
