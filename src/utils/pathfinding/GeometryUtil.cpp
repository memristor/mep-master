/*
 * GeometryUtil.cpp
 *
 *  Created on: Oct 23, 2013
 *      Author: PCX
 */

#include "GeometryUtil.h"

namespace geometry {

double GeometryUtil::perpDot(const Point2D &a, const Point2D &b)
{
	return (a.getY() * b.getX()) - (a.getX() * b.getY());
}

// da li se seku duzi
int GeometryUtil::linesIntersect(const Point2D &A1, const Point2D &A2, const Point2D &B1, const Point2D &B2)
{
	Point2D a;
	Point2D b;
	a.setX(A2.getX() - A1.getX());
	a.setY(A2.getY() - A1.getY());
	b.setX(B2.getX() - B1.getX());
	b.setY(B2.getY() - B1.getY());

	double f = GeometryUtil::perpDot(a, b);
	if (f == 0)      // lines are parallel
	{
		return false;
	}

	Point2D c;
	c.setX(B2.getX() - A2.getX());
	c.setY(B2.getY() - A2.getY());

	double aa = GeometryUtil::perpDot(a, c);
	double bb = GeometryUtil::perpDot(b, c);

	if (f < 0)
	{
		if (aa > 0) return false;
		if (bb > 0) return false;
		if (aa < f) return false;
		if (bb < f) return false;
	}
	else
	{
		if (aa < 0) return false;
		if (bb < 0) return false;
		if (aa > f) return false;
		if (bb > f) return false;
	}

	return true;
}

} /* namespace geometry */
