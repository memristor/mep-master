## Install Node.js
### Linux Debian based
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Alternative
```
wget https://nodejs.org/dist/v6.3.0/node-v6.3.0-linux-armv6l.tar.xz
tar -xvf node-v6.3.0-linux-armv6l.tar.xz
cd node-v6.3.0-linux-armv6l
sudo cp -R * /usr/local/
```

### Windows
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