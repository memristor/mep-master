/** @namespace utils */

const TAG = 'ModuleLoader';

/**
 * Make instance of class based on JSON
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @memberof utils
 */
class ModuleLoader {
    /**
     * @private
     */
    constructor() {
    }

    /**
     * <p>Initialize modules</p>
     *
     * <p>
     * `modulesConfig` must have structure like
     * <pre>
     * <code>
     * {
     *  ModuleID: {
     *      class: 'path/to/class',
     *      init: true|false
     *  },
     *  NextModuleID: {
     *      class: 'path/to/next/class',
     *      init: true|false
     *  }
     * }
     * </code>
     * </pre>
     * </p>
     *
     * @param modulesConfig {Object} - Array of module configs
     * @param simulation {boolean} - Use simulation suffix
     * @returns {Object} - Returns associative array of instantiated modules
     */
    static load(modulesConfig) {
        var modules = {};

        for (let moduleName in modulesConfig) {
            if (modulesConfig.hasOwnProperty(moduleName) == false) {
                continue;
            }

            let moduleConfig = modulesConfig[moduleName];
            let init = moduleConfig.init;
            let classPath = moduleConfig.class;

            // Do not initialize if `init field == false`
            if (init != false) {
                let ModuleClass = Mep.require(classPath);

                if (typeof ModuleClass === 'function') {
                    modules[moduleName] = new ModuleClass(moduleName, moduleConfig);
                    Mep.Log.debug(TAG, 'Module loaded', moduleName);
                } else {
                    Mep.Log.error(TAG, 'There is no module on path', modulePath);
                }
            }
        }
        return modules;
    }
}

module.exports = ModuleLoader;
