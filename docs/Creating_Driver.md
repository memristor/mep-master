## SkeletonDriver
Let's start with very simple driver which do nothing. 
`SkeletonDriver` meets minimal requirements to become a driver.
```
class SkeletonDriver {
    constructor(name, config) {
    
    }
    
    provides() { return []; }
}
```
Each driver gets variables `name` and `config` in constructor. `name` is unique 
name of each driver instance, and `config` is configuration object for 
instance of the driver.  

Method `provides()` can return empty array or array of strings which 
represents data that can be provided by a driver. If driver provides 
some type of data it must meets a requirements for that type of data. More
will be explained.  

All drivers are located in directory `/drivers` and by convention have
dedicated directory, eg. SkeletonDriver is stored in 
`/drivers/skeleton/SkeletonDriver.js`.  

Every driver must be added in configuration file. By adding our driver
in configuration file DriverManager knows that our driver should be instantiated.
```
... 
Drivers: {
    ... 
    SkeletonDriverInstance: {
        class: 'drivers/skeleton/SkeletonDriver',
        init: true
    }
}
```
An example of a driver in configuration file. `SkeletonDriverInstance` 
in this case is name of the instance of SkeletonDriver. `class` is path
to `SkeletonDriver.js` and `init` field describes if driver should be
instantiated or not.


## SimpleDriver
The code above is example of a very simple driver.
```
const driverManager = Mep.require('drivers/DriverManager').get();

class SimpleDriver {
    constructor(name, config) {
        this.modbusDriver = driverManager.getDriver('ModbusDriver');
    } 
    
    provides() { return ['terrain']; }
}
```

TODO: Explain all segments of the SimpleDriver