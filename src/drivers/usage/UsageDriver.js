const Usage = require('usage');

const TAG = 'UsageDriver';

/**
 * Logs memory and cpu usage
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @example
 * ...
 * "UsageDriver": {
 *     "class": "drivers/usage/UsageDriver",
 *     "load": true,
 *     "refreshPeriod": 1000
 * }
 * ...
 */
class UsageDriver {
    constructor(name, config) {
        this.name = name;
        this.config = config;

        this._usageLoop.bind(this);
        this._usageLoop();
    }

    _usageLoop() {
        let usageDriver = this;

        setTimeout(() => {
            Usage.lookup(process.pid, usageDriver._logUsage);
            usageDriver._usageLoop();
        }, this.config.refreshPeriod);
    }

    _logUsage(err, result) {
        Mep.Telemetry.send(TAG, 'UsageMeasured', {
            memory: result.memory,
            cpu: result.cpu
        });
    }

    getGroups() {
        return [];
    }
}

module.exports = UsageDriver;