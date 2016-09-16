The code above is example of a very simple driver.
```
const driverManager = Mep.require('drivers/DriverManager').get();

class SimpleDriver {
    constructor(name, config) {
        this.modbusDriver = driverManager.getDriver('ModbusDriver');
    } 
    
    provides() { return []; }
}
```

TODO: Explain all segments of the SimpleDriver