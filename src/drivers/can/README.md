# CAN Usage

## Installation
Use tutorial from `docs/CAN-Overlay.pdf`

## Test
Start CAN in loopback mode
```
sudo ip link set can0 up type can bitrate 125000 loopback on
```

Navigate to `test` directory and run `candump` in first terminal
```
./candump any,0:0,#FFFFFFFF
```

and `cansend` in second terminal to listen for messages
```
./cansend can0 123#deadbeef
```

## Errors
- `SIOCGIFINDEX: No such device` Check if CAN board is connected, reboot Raspberry Pi
- `write: Network is down` Start CAN with `sudo ip link set can0 up type can bitrate 125000`