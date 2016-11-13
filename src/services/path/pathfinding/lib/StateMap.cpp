/*
 * StateMap.cpp
 *
 *  Created on: Oct 25, 2013
 *      Author: PCX
 */

#include "StateMap.h"
#include <stdlib.h>

using namespace std;
using namespace geometry;

namespace path_finding {

void StateMap::clearAndDeleteData()
{
	for(typename map<Point2D,State*>::iterator iter = begin(); iter != end(); iter++)
	{
		delete iter->second;
	}

	clear();
}

} /* namespace path_finding */
