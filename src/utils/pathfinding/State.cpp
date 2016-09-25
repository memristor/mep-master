/*
 * State.cpp
 *
 *  Created on: Oct 23, 2013
 *      Author: PCX
 */

#include "State.h"

namespace path_finding {

State::State(PfPoint2D *point, State *parent):point(point), parent(parent), cost(0) {}

PfPoint2D* State::getPoint() const
{
	return point;
}

void State::setPoint(PfPoint2D *newPoint)
{
	point = newPoint;
}

State* State::getParent() const
{
	return parent;
}

void State::setParent(State *newParent)
{
	parent = newParent;
}

int State::getPathCost() const
{
	if (parent == 0) return 0;
	return parent->getPathCost() + point->euclidDist(*(parent->point));
}

int State::getCost() const
{
	return cost;
}

void State::setCost(int newCost)
{
	cost = newCost;
}

} /* namespace path_finding */
