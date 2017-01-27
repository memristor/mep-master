/*
 * KretackiDrajver.cpp
 *
 *  Created on: Nov 7, 2013
 *      Author: LaptopX
 */

#include "MotionDriver.h"
#include <stdio.h>

#define TAG "MotionDriver "

namespace motion
{

MotionDriver::MotionDriver(geometry::Point2D initPosition, int initOrientation, int initSpeed):
    io_mutex(new mutex())
{
	setPositionAndOrientation(initPosition, initOrientation);
	setSpeed(initSpeed);;
	direction = FORWARD;
	state = IDLE;
}

MotionDriver::~MotionDriver()
{
	delete io_mutex;
}

void MotionDriver::finishCommand() {
    LOG(INFO) << TAG << "finishCommand()";

    lock_guard<mutex> lock(*io_mutex);

    char message[] = {
            'i'
    };

    uart.writeUart(message, 1);
}

void MotionDriver::moveStraight(int distance)
{
    LOG(INFO) << TAG << "moveStraight(" << distance << ")";

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
    LOG(INFO) << TAG << "rotateFor(" << relativeAngle << ")";

	lock_guard<mutex> lock(*io_mutex);
	
	char message[] = {
			'T',
			(char)(relativeAngle>>8),
			(char)(relativeAngle)
	};

	uart.writeUart(message, 3);
}

void MotionDriver::rotateTo(int absoluteAngle)
{
    LOG(INFO) << TAG << "rotateTo(" << absoluteAngle << ")";

	lock_guard<mutex> lock(*io_mutex);
	
	char message[] = {
			'A',
			(char)(absoluteAngle>>8),
			(char)(absoluteAngle)
	};

	uart.writeUart(message, 3);
}

void MotionDriver::moveToPosition(geometry::Point2D position, MovingDirection direction)
{   
    LOG(INFO) << TAG << "moveToPosition(" << position.getX() << ", " << position.getY() << ", " << (int)direction << ")";

	lock_guard<mutex> lock(*io_mutex);
	
	char message[] = {
			'N', // G or N
			(char)(position.getX()>>8),
			(char)(position.getX()),
			(char)(position.getY()>>8),
			(char)(position.getY()),
			//0, // krajnja brzina (za sada fiksirana na 0)
			direction
	};

	uart.writeUart(message, 6);
	this->direction = direction;
}

void MotionDriver::moveArc(geometry::Point2D center, int angle, MovingDirection direction)
{
    LOG(INFO) << TAG << "moveArc(" << center.getX() << ", " << center.getY() << ", " << angle << ", " << (int)direction << ")";

	lock_guard<mutex> lock(*io_mutex);

	char message[] = {
			'Q',
			(char)(center.getX()>>8),
			(char)(center.getX()),
			(char)(center.getY()>>8),
			(char)(center.getY()),
			(char)(angle>>8),
			(char)(angle),
			direction
	};

	uart.writeUart(message, 8);
	this->direction = direction;
}

void MotionDriver::stop()
{
     LOG(INFO) << TAG << "stop()";

	lock_guard<mutex> lock(*io_mutex);

	uart.writeUart('S');
}

void MotionDriver::softStop(){
     LOG(INFO) << TAG << "softStop()";

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
    char newSpeed=0;

     LOG(INFO) << TAG << "setSpeed(" << (int)speed << ")";
    lock_guard<mutex> lock(*io_mutex);

    uart.flushOutput();
    uart.flushInput();

	this->speed = speed;

	char message[] = {
			'V',
			(char)speed
	};
	uart.writeUart(message, 2);
    uart.readAll(&newSpeed, 1);

    if (newSpeed != speed){
         LOG(LogType::ERROR) << TAG << "Speed is not set";
    }
}

void MotionDriver::setPositionAndOrientation(const geometry::Point2D position, int orientation)
{
     LOG(INFO) << TAG << "setPositionAndOrientation(" << position.getX() << ", " << position.getY() << ", " << orientation << ")";

	lock_guard<mutex> lock(*io_mutex);

	this->position = position;
	this->orientation = orientation;

	char message[] = {
			'I',
			(char)(position.getX()>>8),
			(char)(position.getX()),
			(char)(position.getY()>>8),
			(char)(position.getY()),
			(char)(orientation>>8),
			(char)(orientation)
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

	position.setX(convertToInt(receiveBuffer[1], receiveBuffer[2]));
	position.setY(convertToInt(receiveBuffer[3], receiveBuffer[4]));
	orientation = convertToInt(receiveBuffer[5], receiveBuffer[6]);
}

int MotionDriver::convertToInt(char msb, char lsb)
{
    return (short)( (msb<<8) | (lsb & 0xFF) );
}

}
