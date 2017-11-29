[![Build Status](https://semaphoreci.com/api/v1/lukicdarkoo/mep-master/branches/master/shields_badge.svg)](https://semaphoreci.com/lukicdarkoo/mep-master)
[![API Doc](https://doxdox.org/images/badge-flat.svg)](https://doxdox.org/Memristor-Robotics/mep-master)
[![Maintainability](https://api.codeclimate.com/v1/badges/23de86cb5cd79b8a5d3d/maintainability)](https://codeclimate.com/github/Memristor-Robotics/mep-master/maintainability)
[![Dependencies](https://david-dm.org/Memristor-Robotics/mep-master.svg)](https://david-dm.org/Memristor-Robotics/mep-master/)

# MEP (Memristor's Eurobot Platform)
MEP is a development platform for easy building and prototyping software for robots. It allows developing drivers for hardware modules, implementation of control algorithms and testing new strategies.

Read more about Memristor at [our website](https://memristor-robotics.github.io/).

## Installation
*only for Debian distros

- Install Node.js & npm
```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```
- Install git `sudo apt-get install git`
- Install MEP
```
git clone https://github.com/Memristor-Robotics/mep-master.git --depth 1 && cd mep-master && sudo ./install
```

## Execute
```
./mep
```

check for arguments
```
./mep --help
```

## Dashboard (simulator & other tools)
[Check here for more details](https://github.com/Memristor-Robotics/mep-dash)

## Documentation
create a documentation locally
```
npm run-script docs
```
or check for [online docs](https://doc.esdoc.org/github.com/Memristor-Robotics/mep-master/identifiers.html)
