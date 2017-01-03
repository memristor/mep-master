# CAN bus driver
CanDriver enables easy access to CAN bus.

## Kernel module installation
Use tutorial from `docs/CAN-Overlay.pdf`

## Testing
Install tools to test CAN bus
```
sudo apt-get install can-utils 
```

Start CAN in loopback mode
```
sudo ip link set can0 up type can bitrate 125000 loopback on
```

Navigate to `test` directory and run `candump` in first terminal
```
candump can0
```

and `cansend` in second terminal to listen for messages
```
cansend can0 123#deadbeef
```

## Errors
- `cannot find device can0` [http://raspberrypi.stackexchange.com/a/54592](http://raspberrypi.stackexchange.com/a/54592)
- `SIOCGIFINDEX: No such device` Check if CAN board is connected, reboot Raspberry Pi
    - `write: Network is down` Start CAN with `sudo ip link set can0 up type can bitrate 125000`