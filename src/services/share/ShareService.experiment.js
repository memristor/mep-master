global.Mep = require('../../Mep');

const ShareService = require('./ShareService');

let share = new ShareService();
share.init({
    position: false
});

share.on('packet', (packet) => {
    console.log(packet);
});

setTimeout(() => {
    console.log('sent');
    share.send('asdasd');
}, 1000);
