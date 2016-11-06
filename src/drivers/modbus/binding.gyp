{
  "targets": [
    {
      "target_name": "modbus",
      "sources": [
        "lib/ModbusClientSwitzerland.cpp",
        "lib/ModbusMaster.cpp",
        "lib/rs485.cpp",
        "lib/ModbusDriverBinder.cpp"
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

