#include "PathFinding.h"
#include "Point2D.h"
#include <vector>
#include <deque>
#include <iostream>

using namespace path_finding;

int main() {
    PathFinding* pf = new PathFinding(2000, 0, 3000, 0);

    std::vector<geometry::Point2D> points;
    points.resize(4);
    points[0] = geometry::Point2D(1, 1);
    points[1] = geometry::Point2D(100, 1);
    points[2] = geometry::Point2D(100, 100);
    points[3] = geometry::Point2D(1, 100);
    pf->addObstacle(points);


    geometry::Point2D start(0, 0);
    geometry::Point2D goal(101, 101);
    std::deque<geometry::Point2D> ret;
    pf->search(start, goal, ret);

    for (geometry::Point2D point : ret) {
        std::cout << point.getX() << " " << point.getY() << std::endl;
    }

	return 0;
}
