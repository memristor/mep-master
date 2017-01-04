[![Build Status](https://semaphoreci.com/api/v1/lukicdarkoo/mep2/branches/master/shields_badge.svg)](https://semaphoreci.com/lukicdarkoo/mep2)
[![API Doc](https://doclets.io/Memristor-Robotics/mep2/master.svg)](https://doclets.io/Memristor-Robotics/mep2/master)
[![Code Climate](https://codeclimate.com/github/Memristor-Robotics/mep2/badges/gpa.svg)](https://codeclimate.com/github/Memristor-Robotics/mep2)
[![Dependencies](https://david-dm.org/Memristor-Robotics/mep2.svg)](https://david-dm.org/Memristor-Robotics/mep2)

# MEP (Memristor's Eurobot Platform)
MEP is a development platform for easy building and prototyping software for robots. It allows developing drivers for hardware modules, implementation of control algorithms and testing new strategies.

Read more about Memristor at [our website](https://memristor-robotics.github.io/).

## Installation
*only for Debian distros

- Install Node.js & npm
```
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
```
- Install git `sudo apt-get install git`
- Install MEP
```
git clone https://github.com/Memristor-Robotics/mep2.git --depth 1 && cd mep2 && sudo ./install
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
or check for [online docs](https://doclets.io/Memristor-Robotics/mep2/master)


## For Windows

### Windows installation for simulation only

Install Visual Studio C++
 
Install mep2:
```
git clone https://github.com/Memristor-Robotics/mep2.git 
npm install
```

### Build services manually

Build services:

```
node-gyp configure --directory src/services/path/pathfinding
node-gyp build --directory src/services/path/pathfinding
```

### Execute 
```
node --harmony-async-await src/Bootstrap.js [Options]
```

check for arguments
```
node src/Bootstrap.js --help
```