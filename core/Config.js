let path = 'default';

/**
 * Configuration manager
 *
 * @reference - https://github.com/lorenwest/node-config/blob/master/lib/config.js
 */
class Config {
  static setConfigPath(configPath) {
    path = configPath;
  }


  /**
   * <p>Get a configuration value</p>
   *
   * <p>
   * This will return the specified property value, throwing an exception if the
   * configuration isn't defined.  It is used to assure configurations are defined
   * before being used, and to prevent typos.
   * </p>
   *
   * @method get
   * @param property {string} - The configuration property to get. Can include '.' sub-properties.
   * @param defaultValue {object} - If property is not found in config file function will return this value.
   * @return value {mixed} - The property value
   */
  static get(property, defaultValue) {
      if(property === null || property === undefined){
        throw new Error("Calling config.get with null or undefined argument");
      }

      var value = Config.getImpl(path, property);

      if (value === undefined) {
        if (defaultValue === null || defaultValue === undefined) {
          throw new Error('Configuration property "' + property + '" is not defined');
        } else {
          return defaultValue;
        }
      }

      return value;
  }

  /**
   * Test that a configuration parameter exists
   *
   * @example
   *    if (config.has('customer.dbName')) {
   *      console.log('Customer database name: ' + config.customer.dbName);
   *    }
   *
   * @method has
   * @param property {string} - The configuration property to test. Can include '.' sub-properties.
   * @return isPresent {boolean} - True if the property is defined, false if not defined.
   */
  static has(property) {
    if(property === null || property === undefined){
      return false;
    }
    return (Config.getImpl(path, property) !== undefined);
  }


  /**
   * Underlying get mechanism
   *
   * @private
   * @method getImpl
   * @param path {string} - Path to config file
   * @param property {string | array[string]} - The property name to get (as an array or '.' delimited string)
   * @return value {mixed} - Property value, including undefined if not defined.
   */
  static getImpl(path, property) {
    var object = require('config/' + path);

    var elems = Array.isArray(property) ? property : property.split('.');
    var name = elems[0];
    var value = object[name];
    if (elems.length <= 1) {
      return value;
    }
    if (value === null || typeof value !== 'object') {
      return undefined;
    }
    return Config.getImpl(value, elems.slice(1));
  }
}
