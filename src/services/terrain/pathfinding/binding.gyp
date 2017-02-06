{
  "targets": [
    {
      "target_name": "pathfinding",
      "sources": [
            "lib/PathFindingBinder.cpp",
            "lib/GeometryUtil.cpp",
            "lib/PathFinding.cpp",
            "lib/PfPoint2D.cpp",
            "lib/Point2D.cpp",
            "lib/Polygon.cpp",
            "lib/State.cpp",
            "lib/StateMap.cpp",
            "lib/StatePriorityQueue.cpp"
        ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "cflags_cc": [
        "-std=c++11",
        "-fexceptions",
        "-O2"
      ]
    }
  ]
}