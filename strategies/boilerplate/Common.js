// Populate a global space with general purpose shortcuts
Mep.require('strategy/Shortcut').make();

// Open claps
global.openClaps = async (percent) => {
    Mep.Log.info("Opening claps...");
    await delay(1000);
    Mep.Log.info("Claps opened at", percent, "%");
};
