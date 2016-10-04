{
  "targets": [
    {
      "target_name": "Robot",
      "sources": [ "Robot.cc"],
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