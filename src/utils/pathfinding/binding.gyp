{
  "targets": [
    {
      "target_name": "pathfinding",
      "sources": [
            "PathFindingBinder.cpp",
            "PathFinding.cpp",
            "PfPoint2D.cpp",
            "Point2D.cpp",
            "Polygon.cpp",
            "State.cpp",
            "StateMap.cpp",
            "StatePriorityQueue.cpp"
        ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "cflags_cc": [
        "-std=c++11",
        "-fexceptions"
      ]
    }
  ]
}