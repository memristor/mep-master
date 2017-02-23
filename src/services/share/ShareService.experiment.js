global.Mep = require('../../Mep');

const ShareService = require('./ShareService');

let share = new ShareService();
share.init();

setTimeout(() => {
    console.log('sent');
    share.send('asdasd');
}, 1000);
