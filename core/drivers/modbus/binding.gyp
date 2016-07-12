{
  "targets": [
    {
      "target_name": "motion",
      "target_name": "modbus",
      "sources": [ "Modbus.cpp", "ModbusClientSwitzerland.cpp", "ModbusMaster.cpp", "rs485.cpp" ],
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