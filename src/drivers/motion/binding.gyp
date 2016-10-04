{
  "targets": [
    {
      "target_name": "motion",
      "sources": [
        "lib/MotionDriverBinder.cpp",
        "lib/MotionDriver.cpp",
        "lib/Point2D.cpp",
        "lib/UartConnection.cpp"
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

