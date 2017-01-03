#include "PathFinding.h"
#include "Point2D.h"
#include <vector>
#include <deque>
#include <iostream>

using namespace path_finding;

void findPath(PathFinding* pf, int startX, int startY, int goalX, int goalY) {
    geometry::Point2D start(startX, startY);
    geometry::Point2D goal(goalX, goalY);
    std::deque<geometry::Point2D> ret;
    pf->search(start, goal, ret);

    for (geometry::Point2D point : ret) {
        std::cout << point.getX() << " " << point.getY() << std::endl;
    }
}

int main() {
    PathFinding* pf = new PathFinding(3000, 0, 1300, -800);

    std::vector<geometry::Point2D> points;
    points.resize(3);
    points[0] = geometry::Point2D(655, 1225);
    points[1] = geometry::Point2D(710, 440);
    points[2] = geometry::Point2D(2090, 365);
    pf->addObstacle(points);

    std::cout << "Go to destination" << std::endl;
    findPath(pf, 0, 0, 2370, 1130);

    std::cout << "Let's return now" << std::endl;
    findPath(pf, 2370, 1130, 30, 30);

	return 0;
}
