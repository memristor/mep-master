/*
 * PathFinding1.h
 *
 *  Created on: Oct 23, 2013
 *      Author: PCX
 */


#ifndef PATHFINDING1_H_
#define PATHFINDING1_H_

#include <vector>
#include <deque>
#include <map>

#include "Polygon.h"
#include "Point2D.h"
#include "PfPoint2D.h"
#include "StatePriorityQueue.h"
#include "StateMap.h"
#include "State.h"

namespace path_finding {

class PathFinding
{
private:
	PfPoint2D startPoint;
	PfPoint2D goalPoint;
	State *startState;

	int newObstacleId;

	std::map<int, Polygon*> allObstacles; // sve prepreke

	StatePriorityQueue openList;
	StateMap closedList;
	std::vector<State*> childrenList;

	int maxX, minX, maxY, minY;

	int heuristic(const State &s) const;
	int evalFunction(const State &s) const;

	bool checkVisibilityFor(const std::map<int, Polygon*> &polygons, const geometry::Point2D &p1, const geometry::Point2D &p2) const;
	bool isVisible(const PfPoint2D &p1, const PfPoint2D &p2) const;
	bool isEdgeValid(const PfPoint2D &startPoint, const PfPoint2D &endPoint) const;
	bool isInsideField(const geometry::Point2D &point) const;
	Polygon* obstacleAround(const geometry::Point2D &point) const;
	Polygon* polygonAround(const geometry::Point2D &point, const std::map<int, Polygon*> &polygons) const;

	void generateChildren(State &currentState, std::vector<State*> &childrenList);

	void cleanUpStates();
	void cleanUpObstacles();
	void deleteObstacle(Polygon* pol);
	// obrisi reference na tacke poligona pol iz ostalih tacaka
	void removeFromGraph(Polygon* pol);
	// brise referencu na tacku pointToRemove iz mozda vidljivih iz tacke removeFromPoint
	void removeMaybevisibleFromPoint(PfPoint2D &pointToRemove, PfPoint2D &removeFromPoint);

	void addAdjecentMaybeVisible(Polygon &pol);
	void addMaybeVisibleToStart(Polygon &pol);
	void addVisibility(Polygon &pol);
	void addMaybeVisibleToAll(Polygon &pol, std::map<int, Polygon*> &otherObstacles);

public:
	PathFinding(int maxX, int minX, int maxY, int minY);
	~PathFinding();
	bool search(geometry::Point2D &start, geometry::Point2D &goal, std::deque<geometry::Point2D> &ret);
	// dodaje poligon sa prosledjenim tackama, vraca id poligona
	int addObstacle(const std::vector<geometry::Point2D> &obstaclePoints);
	void removeObstacle(int obstacleId);

	std::map<int, Polygon*> getAllObstacles();
};

} /* namespace path_finding */
#endif /* PATHFINDING1_H_ */
