async function delay(milliseconds) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, milliseconds);
    });
}

module.exports = delay;