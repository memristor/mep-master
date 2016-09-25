/*
 * State.h
 *
 *  Created on: Oct 23, 2013
 *      Author: PCX
 */

#ifndef STATE_H_
#define STATE_H_

#include "PfPoint2D.h"

namespace path_finding {

class State {
private:
	PfPoint2D *point;
	State *parent;
	int cost; // cena sa heuristikom, setuje se spolja
public:
	State(PfPoint2D *pointt, State *parent);
	PfPoint2D* getPoint() const;
	void setPoint(PfPoint2D *newPoint);
	State* getParent() const;
	void setParent(State *newParent);
	int getPathCost() const; // stvarna cena od pocetnog stanja
	int getCost() const; // cena sa heuristikom, setuje se spolja
	void setCost(int cost);
};

} /* namespace path_finding */
#endif /* STATE_H_ */
