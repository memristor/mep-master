/**
 * A goal of the class is to check if drivers are correctly implemented.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @memberOf utils
 */

class DriverChecker {
    static check(driver) {
        let groups;
        if (typeof driver.getGroups === 'function') {
            groups = driver.getGroups();
        } else {
            throw TypeError(driver.constructor.name + ' doesn\'t have member getGroups()');
        }

        for (let group of groups) {
            switch (group) {
                case 'position':
                    DriverChecker._checkPosition(driver);
                    break;

                case 'terrain':
                    DriverChecker._checkTerrain(driver);
                    break;
            }
        }
    }

    static _checkPosition(driver) {
        let driverClassName = driver.constructor.name;

        // Check getPosition()
        if (typeof driver.getPosition !== 'function') {
            throw TypeError(driverClassName + ' requires method getPosition()');
        }
        if (driver.getPosition().constructor.name !== 'Point') {
            throw TypeError('Method '+ driverClassName +'.getPosition() must return Point');
        }
    }

    static _checkTerrain(driver) {

    }
}

module.exports = DriverChecker;
