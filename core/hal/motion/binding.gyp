{
  "targets": [
    {
      "target_name": "motion",
      "sources": [ "Motion.cpp", "MotionDriver.cpp", "Point2D.cpp", "UartConnection.cpp" ],
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