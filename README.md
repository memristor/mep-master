[![Build Status](https://semaphoreci.com/api/v1/lukicdarkoo/mep2/branches/master/shields_badge.svg)](https://semaphoreci.com/lukicdarkoo/mep2)
[![API Doc](https://doclets.io/Memristor-Robotics/mep2/master.svg)](https://doclets.io/Memristor-Robotics/mep2/master)
[![Code Climate](https://codeclimate.com/github/Memristor-Robotics/mep2/badges/gpa.svg)](https://codeclimate.com/github/Memristor-Robotics/mep2)
[![Issue Count](https://codeclimate.com/github/Memristor-Robotics/mep2/badges/issue_count.svg)](https://codeclimate.com/github/Memristor-Robotics/mep2)
[![Dependencies](https://david-dm.org/Memristor-Robotics/mep2.svg)](https://david-dm.org/Memristor-Robotics/mep2)

# MEP (Memristor's Eurobot Platform)
MEP is a development platform for easy building and prototyping software for robots. It allows developing drivers for hardware modules, implementation of control algorithms and testing new strategies.

Read more about Memristor at [our website](https://memristor-robotics.github.io/).

## Installation
*only for Debian distros
```
git clone https://github.com/Memristor-Robotics/mep2.git --depth 1 && cd mep2 && sudo ./install
```

## Windows installation for testing only (simulator)

Install Visual Studio C++ 

```
git clone https://github.com/Memristor-Robotics/mep2.git 
npm install
npm run-script simulator
```

## Build services manually (Windows)

Build services:

```
node-gyp configure --directory src/services/path/pathfinding
node-gyp build --directory src/services/path/pathfinding
```

Build drivers:

```
node-gyp configure --directory src/drivers/motion
node-gyp build --directory src/drivers/motion

node-gyp configure --directory src/drivers/modbus
node-gyp build --directory src/drivers/modbus
```


## Execute
```
./mep
```
check for arguments
```
./mep --help
```

## Simulator

```
./simulator
```

## Documentation
create a documentation locally
```
npm run-script docs
```
or check for [online docs](https://doclets.io/Memristor-Robotics/mep2/master)
