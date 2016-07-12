## Install Node.js
### Linux Debian
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Windows only
- [Node.js](https://nodejs.org/en/download/current/)
- [Microsoft Visual C++](https://www.microsoft.com/en-us/download/details.aspx?id=48145)
- [Python 2.x](https://www.python.org/downloads/)

### Global npm modules
```
npm install -g jsdoc mocha node-gyp
```


## Generate docs
```
npm run-script docs
```

## Run tests
```
npm test
```