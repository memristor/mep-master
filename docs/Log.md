## Logger

Please don't use `console.log(message)`! Instead of that use built in logging 
system `Mep.Log.debug(module, message)`. For more details please check reference for 
**Log** class.

## Logger configuration

Configuration can be done via configuration file located under src/config directory.

Sample configuration: 
```
"Log": {
  "console" :{
    "active" : true,
    "outputMode" : "short",
    "color": true
  },
  "file" :{
    "active" : false,
    "file" : "javascript.log",
    "period" : "1d",
    "count" : 3
  },
  "elasticsearch": {
    "active" : false,
    "level" : "debug",
    "host" : "http://localhost:9200",
    "indexPattern" : "[mep2_logs-]YYYY-MM-DD",
    "type": "log"
  }
},
```

## Loggers
 
### console

Console logger parameters:

- active (false): true/false : activate console logger
- outputMode (short): short|long|simple|json|bunyan [see bunyan-format](https://github.com/thlorenz/bunyan-format)
- color (true): toggles colors in output

By default log level is debug. 

### file 

File logger parameters:

- active (false): true/false : activate file logger
- file (javascript.log): log filename, either an absolute path, or relative to ./logs directory 
- period (1d): rotate log every day
- count (3): backup only 

By default log level is debug.

### elasticsearch

- active (false): true/false : activate elasticsearch logger
- level (debug): debug/info : debug level
- host (http://localhost:9200) : elasticsearch server http address
- index (mep2_logs) : elasticsearch index name. (no pattern allowed here)
- indexPattern (\[mep2_logs-]YYYY-MM-DD) : elasticsearch index pattern. Can be a static name or a dynamic with YYYY-MM-DD pattern.
- type (log): elasticsearch type

If index is configured, indexPattern is ignored.

## Performance Parameter

Log are impacted by "performance" parameter, if "performance" == true : Log level is limited to "info" for all loggers.
 
