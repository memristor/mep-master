/*
 * PathFinding1.cpp
 *
 *  Created on: Oct 23, 2013
 *      Author: PCX
 */

#include <stdlib.h>
#include "PathFinding.h"
#include "GeometryUtil.h"

using namespace std;

namespace path_finding {

PathFinding::PathFinding(int maxX, int minX, int maxY, int minY):
		startState(NULL), newObstacleId(0), maxX(maxX), minX(minX), maxY(maxY), minY(minY)
{}

PathFinding::~PathFinding()
{
	cleanUpStates();
	cleanUpObstacles();
}

// funkcija h koja daje heuristiku, tj pretpostavlja cenu od prosledjenog stanja do cilja
int PathFinding::heuristic(const State &s) const
{
	return s.getPoint()->euclidDist(goalPoint);
}

// funkcija f koja evaluira stanje (sto manje to bolje)
int PathFinding::evalFunction(const State &s) const
{
	return s.getPathCost() + heuristic(s);
}

// proveri vidljivost izmedju p1 i p2 za prepreke iz liste polygons
bool PathFinding::checkVisibilityFor(const map<int, Polygon*> &polygons, const geometry::Point2D &p1, const geometry::Point2D &p2) const
{
	bool p1OnEdge, p2OnEdge, p1OnPolygon, p2OnPolygon, bothOnSameEdge;

	//foreach (Polygon pol in polygons)
	for(map<int, Polygon*>::const_iterator polIter = polygons.begin();polIter != polygons.end();polIter++)
	{
		Polygon* pol = polIter->second;

		p1OnPolygon = false;
		p2OnPolygon = false;
		bothOnSameEdge = false;

		// prodji kroz sve tacke poligona (sve stranice)
		for(unsigned int i=0;i < pol->getPoints().size();i++)
		{
			// ako nije poslednja gledaj liniju sa sledecom, ako jeste poslednja gledaj liniju sa prvom
			const geometry::Point2D &edgeP1 = *pol->getPoints()[i];
			const geometry::Point2D &edgeP2 = *pol->getPoints()[(i != pol->getPoints().size() - 1) ? (i + 1) : (0)];

			p1OnEdge = (p1 == edgeP1) || (p1 == edgeP2);
			p2OnEdge = (p2 == edgeP1) || (p2 == edgeP2);

			if(p1OnEdge) p1OnPolygon = true;
			if(p2OnEdge) p2OnPolygon = true;

			// ako su obe tacke na jednoj ivici onda ovaj poligon ne smeta
			if(p1OnEdge && p2OnEdge)
			{
				bothOnSameEdge = true;
				break;
			}
			else if(p1OnEdge || p2OnEdge) // ako je samo jedna tacka na ivici onda ova ivica nesmeta
			{
				continue;
			}

			// proveri da li se seku putanja i ivica poligona
			if (geometry::GeometryUtil::linesIntersect(p1, p2, edgeP1, edgeP2))
			{

				return false;
			}
		}

		// ako su obe tacke na poligonu, a nisu na istoj ivici (ide kroz poligon)
		if(p1OnPolygon && p2OnPolygon && !bothOnSameEdge)
		{
			return false;
		}
	}

	return true;
}

// da li je deo putanje validan
bool PathFinding::isEdgeValid(const PfPoint2D &startPoint, const PfPoint2D &endPoint) const
{
	// ako nije cilj unutar nekog poligona, i ako je vidljiv iz starta i ako je unutar terena isInsideField()
	return isInsideField(endPoint) && (obstacleAround(endPoint) == NULL) && isVisible(startPoint, endPoint);
}

// da li je unutar terena
bool PathFinding::isInsideField(const geometry::Point2D &point) const
{
	return ((point.getX() <= maxX) && (point.getX() >= minX) && (point.getY() <= maxY) && (point.getY() >= minY));
}

// odredjuje da li su tacke p1 i p2 medjusobno vidljive
bool PathFinding::isVisible(const PfPoint2D &p1, const PfPoint2D &p2) const
{
	return checkVisibilityFor(allObstacles, p1, p2); // ako ni jedan poligon ne smeta vrati true
}

// proverava da li je tacka unutar bilo koje prepreke
Polygon* PathFinding::obstacleAround(const geometry::Point2D &point) const
{
	//foreach (Polygon pol in allObstacles)
	return polygonAround(point, allObstacles);
}

// koji poligon je oko tacke point iz liste polygons
Polygon* PathFinding::polygonAround(const geometry::Point2D &point, const map<int, Polygon*> &polygons) const
{
	for(map<int, Polygon*>::const_iterator polIter = polygons.begin();polIter != polygons.end();polIter++)
	{
		Polygon* pol = polIter->second;
		if (pol->isInside(point)) return &(*pol);
	}
	return NULL;
}

// daje moguca (vidljiva) stanja u koja se moze preci iz datog stanja
void PathFinding::generateChildren(State &currentState, vector<State*> &childrenList)
{
	childrenList.clear();

	State *newState;

	// ako je vidljivo ciljno stanje
	if (isVisible(*currentState.getPoint(), goalPoint))
	{
		newState = new State(&goalPoint, &currentState);
		childrenList.push_back(newState);

		return;
	}

	// prodji kroz sve mozda vidljive tacke
	for(vector<PfPoint2D*>::iterator polPointIter = currentState.getPoint()->getMaybeVisible().begin(); polPointIter != currentState.getPoint()->getMaybeVisible().end(); polPointIter++)
	{
		PfPoint2D* polPoint = *polPointIter;

		// ako je vidljiva tacka dodaj je kao stanje naslednik
		if (isEdgeValid(*currentState.getPoint(), *polPoint))
		{
			newState = new State(polPoint, &currentState);
			childrenList.push_back(newState);
		}
	}
}

bool PathFinding::search(geometry::Point2D &start, geometry::Point2D &goal, deque<geometry::Point2D> &ret)
{
	State *currentState;

	cleanUpStates();

	startPoint.setX(start.getX());
	startPoint.setY(start.getY());
	goalPoint.setX(goal.getX());
	goalPoint.setY(goal.getY());

	startState = new State(&startPoint, NULL);

	// ako je cilj unutar nekog poligona
	if (obstacleAround(goalPoint) != NULL)
	{
		return false;
	}

	// prepreka u kojoj je startna tacka
	Polygon *aroundStartStatePolygon = obstacleAround(*startState->getPoint());

	if (aroundStartStatePolygon != NULL) // ako je start unutar prepreke
	{
		State *secondState; // stanje koje se dodaje u slucaju da je start unutar prepreke

		closedList[*startState->getPoint()] = startState;

		// nadji najblizu tacku na prepreci i idi prvo do nje

		int minDist = startState->getPoint()->euclidDist(*aroundStartStatePolygon->getPoints().back());
		int tempDist;

		secondState = new State(aroundStartStatePolygon->getPoints().back(), NULL);

		bool success = false; // da li postoji tacka na poligonu do koje se moze stici
		for(vector<PfPoint2D*>::iterator polPointIter = aroundStartStatePolygon->getPoints().begin(); polPointIter != aroundStartStatePolygon->getPoints().end(); polPointIter++)
		{
			PfPoint2D* polPoint = *polPointIter;

			if(isEdgeValid(*startState->getPoint(), *polPoint))
			{
				success = true;
				tempDist = startState->getPoint()->euclidDist(*polPoint);
				if (minDist > tempDist)
				{
					secondState->setPoint(polPoint);
					minDist = tempDist;
				}
			}
		}

		// ako nema tacaka na koje moze da se ode (TODO mozda moze pametnije da se uradi)
		if(!success) return false;

		// ubaci startState kao prethodno u secondState
		secondState->setParent(startState);

		// ubaci secondState u open listu
		openList.push(secondState);
	}
	else
	{
		openList.push(startState);
	}

	while (1)
	{
		if(!openList.pop(currentState)) // uzmi najbolje stanje iz open
		{
			return false; // openList prazna, neuspesna pretraga
		}

		closedList[*currentState->getPoint()] = currentState;

		if (goalPoint == *currentState->getPoint()) break; // ako je cilj zavrsi

		generateChildren(*currentState, childrenList); // razvij stanje u listu naslednika

		//foreach (pfState child in children) // za svakog naslednika
		for(vector<State*>::iterator stateIter = childrenList.begin(); stateIter != childrenList.end(); stateIter++)
		{
			State* childState = *stateIter;

			State* existingInClosed = closedList[*childState->getPoint()];
			State* existingInOpen = openList.getByPoint(*childState->getPoint());

			if ((existingInClosed == NULL) && (existingInOpen == NULL)) // ako nije vec u open ili closed
			{
				childState->setCost(evalFunction(*childState));
				openList.push(childState); // dodaj ga u open
			}
			else
			{
				if (existingInOpen != NULL)
				{
					if (childState->getPathCost() < existingInOpen->getPathCost()) // ako je getPathCost manji za novo stanje
					{
						existingInOpen->setParent(currentState); // zameni postojece stanje sa trenutnim (zameni roditelja posto su koordinate vec iste)
						existingInOpen->setCost(evalFunction(*existingInOpen));
					}
				}
				else // u closed je
				{
					if (childState->getPathCost() < existingInClosed->getPathCost()) // ako je getPathCost manji za novo stanje
					{
						// izbaci staro stanje iz closed i zameni ga sa novim koje se dodaje u open
						closedList.erase(*existingInClosed->getPoint());
						existingInClosed->setParent(currentState);
						existingInClosed->setCost(evalFunction(*existingInClosed));
						openList.push(existingInClosed);
					}
				}

				delete childState;
			}
		}
	}

	// upisi u ret tacke iz rezultujuce putanje
	State *tempState = currentState;

	while(tempState->getParent() != NULL)
	{
		ret.push_front(*tempState->getPoint());
		tempState = tempState->getParent();
	}

	return true;
}

void PathFinding::cleanUpStates()
{
	closedList.clearAndDeleteData();
	openList.clearAndDeleteData();
}

void PathFinding::cleanUpObstacles()
{
	// obrisi sve prepreke
	for(map<int, Polygon*>::const_iterator polIter = allObstacles.begin();polIter != allObstacles.end();polIter++)
	{
		delete polIter->second;
	}
}

int PathFinding::addObstacle(const vector<geometry::Point2D> &obstaclePoints)
{
    std::lock_guard<std::mutex> lock(mtx);

	Polygon *newPol = new Polygon(obstaclePoints);

	addAdjecentMaybeVisible(*newPol);
	addMaybeVisibleToStart(*newPol);
	addVisibility(*newPol);

	// dodaj pod slobodnim id-em
	allObstacles[newObstacleId] = newPol;

	// vrati id upravo dodatog i inkrementiraj obstacleIdCount
	return newObstacleId++;
}

// obrisi reference na tacke poligona pol iz ostalih tacaka
void PathFinding::removeFromGraph(Polygon* pol)
{
	// prodji kroz sve tacke poligona
	for (vector<PfPoint2D*>::const_iterator polPointIter = pol->getPoints().begin(); polPointIter != pol->getPoints().end();polPointIter++)
	{
		PfPoint2D* polPoint = *polPointIter;

		// izbaci iz start tacke
		removeMaybevisibleFromPoint(*polPoint, startPoint);

		// prodji kroz sve mozda vidljive iz tacke poligona
		for (vector<PfPoint2D*>::const_iterator mvisPointIter = polPoint->getMaybeVisible().begin();mvisPointIter != polPoint->getMaybeVisible().end();mvisPointIter++)
		{
			PfPoint2D* mvisPoint = *mvisPointIter;
			// obrisi tacku poligona iz mozda vidljivih
			removeMaybevisibleFromPoint(*polPoint, *mvisPoint);
		}
	}
}

// brise referencu na tacku pointToRemove iz mozda vidljivih iz tacke removeFromPoint
void PathFinding::removeMaybevisibleFromPoint(PfPoint2D &pointToRemove, PfPoint2D &removeFromPoint)
{
	// prodji kroz sve tacke vidljive iz prosledjene tacke removeFromPoint
	for(vector<PfPoint2D*>::iterator polPointIterOther = removeFromPoint.getMaybeVisible().begin(); polPointIterOther != removeFromPoint.getMaybeVisible().end(); polPointIterOther++)
	{
		PfPoint2D* polPointOther = *polPointIterOther;

		// kad nadjes tacku pointToRemove medju mozda vidljivima obrisi je
		if((&pointToRemove) == (polPointOther))
		{
			removeFromPoint.getMaybeVisible().erase(polPointIterOther);
			return;
		}
	}
}

void PathFinding::deleteObstacle(Polygon* pol)
{
	// obrisi veze sa drugim tackama u grafu
	removeFromGraph(pol);

	delete pol;
}

void PathFinding::removeObstacle(int obstacleId)
{
	Polygon *pol;

	if(allObstacles.find(obstacleId) != allObstacles.end())
	{
		pol = allObstacles[obstacleId];
		allObstacles.erase(obstacleId);
	}
	else
	{
		return;
	}

	deleteObstacle(pol);
}

// dodaj susedne tacke poligona pol medjusobno kao mozda vidljive
void PathFinding::addAdjecentMaybeVisible(Polygon &pol)
{
	const int pointsCount = pol.getPoints().size();

	for(int point=0; point < pointsCount; point++)
	{
		// dodaj sve susedne tacke poligona
		pol.getPoints()[point]->getMaybeVisible().push_back(pol.getPoints()[(point==0)?(pointsCount-1):(point-1)]);
		pol.getPoints()[point]->getMaybeVisible().push_back(pol.getPoints()[(point==(pointsCount-1))?(0):(point+1)]);
	}
}

// dodaj sve tacke poligona kao mozda vidljive u startnu tacku
void PathFinding::addMaybeVisibleToStart(Polygon &pol)
{
	for(vector<PfPoint2D*>::const_iterator polPointIter = pol.getPoints().begin();polPointIter != pol.getPoints().end();polPointIter++)
	{
		PfPoint2D* polPoint = *polPointIter;
		startPoint.getMaybeVisible().push_back(polPoint);
	}
}

// odredi vidljivost tacaka poligona sa tackama poligona
void PathFinding::addVisibility(Polygon &pol)
{
	// prodji kroz sve tacke poligona
	for(vector<PfPoint2D*>::const_iterator polPointIter = pol.getPoints().begin();polPointIter != pol.getPoints().end();polPointIter++)
	{
		PfPoint2D* polPoint = *polPointIter;

		// za sve poligone
		for(map<int, Polygon*>::const_iterator polIterOther = allObstacles.begin(); polIterOther != allObstacles.end(); polIterOther++)
		{
			Polygon* polOther = polIterOther->second;

			// prodji kroz sve tacke drugih poligona
			for(vector<PfPoint2D*>::const_iterator polPointIterOther = polOther->getPoints().begin(); polPointIterOther != polOther->getPoints().end(); polPointIterOther++)
			{
				PfPoint2D* polPointOther = *polPointIterOther;

				polPoint->getMaybeVisible().push_back(polPointOther);
				polPointOther->getMaybeVisible().push_back(polPoint);
			}
		}
	}
}

// dodaj tacke poligona kao mozda vidljive u sve tacke iz liste poligona otherObstacles
void PathFinding::addMaybeVisibleToAll(Polygon &pol, map<int, Polygon*> &otherObstacles)
{
	for(map<int, Polygon*>::const_iterator polIterOther = otherObstacles.begin(); polIterOther != otherObstacles.end(); polIterOther++)
	{
		Polygon* polOther = polIterOther->second;

		for(vector<PfPoint2D*>::const_iterator polPointIterOther = polOther->getPoints().begin(); polPointIterOther != polOther->getPoints().end(); polPointIterOther++)
		{
			PfPoint2D* polPointOther = *polPointIterOther;

			for(vector<PfPoint2D*>::const_iterator polPointIter = pol.getPoints().begin(); polPointIter != pol.getPoints().end(); polPointIter++)
			{
				PfPoint2D* polPoint = *polPointIter;

				polPoint->getMaybeVisible().push_back(polPointOther);
				polPointOther->getMaybeVisible().push_back(polPoint);
			}
		}
	}
}

map<int, Polygon*> PathFinding::getAllObstacles()
{
	return allObstacles;
}

} /* namespace path_finding */

