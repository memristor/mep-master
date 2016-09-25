/*
 * PfPoint2D.h
 *
 *  Created on: Oct 23, 2013
 *      Author: PCX
 */

#ifndef PFPOINT2D_H_
#define PFPOINT2D_H_

#include <vector>
#include "Point2D.h"

namespace path_finding {

class PfPoint2D: public geometry::Point2D {
private:
	std::vector<PfPoint2D*> maybeVisible;
public:
	PfPoint2D();
	PfPoint2D(int x, int y);
	PfPoint2D(const geometry::Point2D &point);
	std::vector<PfPoint2D*>& getMaybeVisible();
	PfPoint2D& operator=(const PfPoint2D &rhs);
};

} /* namespace path_finding */
#endif /* PFPOINT2D_H_ */
