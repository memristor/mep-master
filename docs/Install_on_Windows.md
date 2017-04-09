# Install on Windows

- Install [Microsoft Visual C++](https://www.microsoft.com/en-us/download/details.aspx?id=48145)
- Install [Python 2.x](https://www.python.org/downloads/)
- Install [Node.js](https://nodejs.org/en/download/current/)

Install mep-master:
```
git clone https://github.com/Memristor-Robotics/mep-master.git
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
