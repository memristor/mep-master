/*
 * StatePriorityQueue.cpp
 *
 *  Created on: Oct 25, 2013
 *      Author: PCX
 */

#include "StatePriorityQueue.h"
#include <cstdlib>


namespace path_finding {

void StatePriorityQueue::push(State* newDat)
{
	stateQueue.push(newDat);
	stateMap[*newDat->getPoint()] = newDat;
}

bool StatePriorityQueue::pop(State*& ret)
{
	if(stateQueue.empty())
	{
		return false;
	}
	
	ret = stateQueue.top();
	stateQueue.pop();
	stateMap.erase(*ret->getPoint());
	
	return true;
}

State* StatePriorityQueue::getByPoint(const geometry::Point2D& point)
{
	return stateMap[point];
}

void StatePriorityQueue::clearAndDeleteData()
{
	while(!stateQueue.empty())
	{
		delete stateQueue.top();
		stateQueue.pop();
	}
	
	stateMap.clear();
}

} /* namespace path_finding */
