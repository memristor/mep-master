/*
 * Polygon.h
 *
 *  Created on: Oct 23, 2013
 *      Author: PCX
 */


#ifndef POLYGON_H_
#define POLYGON_H_

#include <vector>
#include "PfPoint2D.h"

namespace path_finding {

class Polygon {
private:
	std::vector<PfPoint2D*> points;
public:
	Polygon();
	Polygon(const std::vector<geometry::Point2D> &newPoints);
	~Polygon();
	bool isInside(const geometry::Point2D &point) const; // proverava da li je tacka unutar poligona
	std::vector<PfPoint2D*>& getPoints();
};

} /* namespace path_finding */
#endif /* POLYGON_H_ */
