{
  "targets": [
    {
      "target_name": "Robot",
      "sources": [ "Robot.cc"],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}