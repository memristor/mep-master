/*
 * StatePriorityQueue.h
 *
 *  Created on: Oct 25, 2013
 *      Author: PCX
 */

#ifndef STATEPRIORITYQUEUE_H_
#define STATEPRIORITYQUEUE_H_

#include <queue>
#include <map>
#include <vector>
#include "State.h"

namespace path_finding {

class StatePriorityQueue
{
private:
	
	class CompareStates
	{
	public:
		bool operator() (State*& lhs, State*&rhs)
		{
			return lhs->getCost() > rhs->getCost();
		}
	};
	
	std::priority_queue<State*, std::vector<State*>, StatePriorityQueue::CompareStates> stateQueue;
	std::map<geometry::Point2D, State*> stateMap;

public:

	void push(State* state);
	bool pop(State*& ret);
	State* getByPoint(const geometry::Point2D& point);

	void clearAndDeleteData();
};

} /* namespace path_finding */
#endif /* STATEPRIORITYQUEUE_H_ */
