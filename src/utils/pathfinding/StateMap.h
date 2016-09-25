/*
 * StateMap.h
 *
 *  Created on: Oct 25, 2013
 *      Author: PCX
 */

#ifndef STATEMAP_H_
#define STATEMAP_H_

#include <map>
#include "State.h"
#include "Point2D.h"

namespace path_finding {

class StateMap : public std::map<geometry::Point2D, State*>
{
public:
	void clearAndDeleteData();
};

} /* namespace path_finding */
#endif /* STATEMAP_H_ */
