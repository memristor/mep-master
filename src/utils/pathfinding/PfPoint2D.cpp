/*
 * PfPoint2D.cpp
 *
 *  Created on: Oct 23, 2013
 *      Author: PCX
 */

#include "PfPoint2D.h"

namespace path_finding {

PfPoint2D::PfPoint2D(): Point2D(0,0){}

PfPoint2D::PfPoint2D(int x, int y): Point2D(x,y){}

PfPoint2D::PfPoint2D(const geometry::Point2D &point): Point2D(point){}

std::vector<PfPoint2D*>& PfPoint2D::getMaybeVisible()
{
	return maybeVisible;
}

PfPoint2D& PfPoint2D::operator=(const PfPoint2D &rhs)
{
    if(this == &rhs) return *this;
    Point2D::operator =(rhs);
    maybeVisible = rhs.maybeVisible;
    return *this;
}

} /* namespace path_finding */
