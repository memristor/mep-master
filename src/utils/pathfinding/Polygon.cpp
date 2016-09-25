/*
 * Polygon.cpp
 *
 *  Created on: Oct 23, 2013
 *      Author: PCX
 */

#include "Polygon.h"

using namespace std;

namespace path_finding {

Polygon::Polygon() {}
Polygon::Polygon(const vector<geometry::Point2D> &newPoints)
{
	// kreira vektor PfPoint2D tacaka (points) od geometry::Point2D tacaka na ulazu (newPoints)
	for(vector<geometry::Point2D>::const_iterator polPointIter = newPoints.begin(); polPointIter != newPoints.end(); polPointIter++)
	{
		points.push_back(new PfPoint2D(*polPointIter));
	}
}

Polygon::~Polygon()
{
	for(vector<PfPoint2D*>::const_iterator polPointIter = points.begin();polPointIter != points.end();polPointIter++)
	{
		PfPoint2D* polPoint = *polPointIter;
		delete polPoint;
	}
}

vector<PfPoint2D*>& Polygon::getPoints()
{
	return points;
}

// proverava da li je tacka unutar poligona, nisam siguran kako radi :), pretpostavljam da je neki ray tracing
bool Polygon::isInside(const geometry::Point2D &point) const
{
	// TODO mozda dodati proveru sa minX, maxX.. da li je unutar opisanog pravougaonika radi ubrzanja, sem ako ga to ne uspori zbog dodatnog racunanja

	bool c = false;

	for (unsigned i = 0, j = points.size() - 1; i < points.size(); j = i++)
	{
		if (*points[i] == point)
		{
			// ako je tacka ivica bas tog poligona nije unutar njega
			return false;
		}

		if ((((*points[i]).getY() > point.getY()) != ((*points[j]).getY() > point.getY())) &&
				(point.getX() < ((*points[j]).getX() - (*points[i]).getX()) * (point.getY() - (*points[i]).getY()) / ((*points[j]).getY() - (*points[i]).getY()) + (*points[i]).getX()))
		{
			c = !c;
		}
	}

	return c;
}

} /* namespace path_finding */
