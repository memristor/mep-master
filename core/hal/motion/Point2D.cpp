/*
 * Point2D.cpp
 *
 *  Created on: Oct 23, 2013
 *      Author: PCX
 */

#include "utils/geometry/Point2D.h"
#include "math.h"

double PI=3.141592653584;

namespace geometry {

Point2D::Point2D():x(0),y(0) {}
Point2D::Point2D(int x, int y):x(x),y(y){}

int Point2D::euclidDist(const Point2D &p) const
{
	return (int)sqrt(((double)(x - p.x) * (double)(x - p.x)) + ((double)(y - p.y) * (double)(y - p.y)));
}

int Point2D::relativeAngleTo(const Point2D &p) const
{
	return (int)((atan2((signed int)(p.y-y), (signed int)(p.x-x)) * 180.0) / M_PI);
}

bool Point2D::operator==(const Point2D &p) const
{
	return x==p.x && y==p.y;
}

int Point2D::getX() const
{
	return x;
}
int Point2D::getY() const
{
	return y;
}

void Point2D::setX(int x)
{
	this->x = x;
}

void Point2D::setY(int y)
{
	this->y = y;
}

Point2D& Point2D::operator=(const Point2D &rhs)
{
    if(this == &rhs) return *this;
    x = rhs.getX();
    y = rhs.getY();
    return *this;
}

bool Point2D::operator<(const Point2D &rhs) const
{
    return (x < rhs.x) || ((x == rhs.x) && (y < rhs.y));
}

ostream& operator<< (ostream &out, Point2D &cPoint){
    out << "(" << cPoint.x << ", " <<
    cPoint.y << ")";
    return out;
}

} /* namespace geometry */
