{
  "targets": [
    {
      "target_name": "modbus",
      "sources": [ "ModbusClientSwitzerland.cpp", "ModbusMaster.cpp", "rs485.cpp", "ModbusDriverBinder.cpp" ],
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