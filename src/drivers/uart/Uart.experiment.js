const Uart = require('./Uart');
const PLLSP = require('../pllsp/PLLSP');


let pllsp = new PLLSP('PLLSP', {});
let uart = new Uart('uart', {
    _protocol: pllsp
});

uart.on('data', (buffer) => {
    console.log(buffer.length);
});


const maxLength = 100;
let buffer = Buffer.alloc(maxLength);
let i = 0;

function send() {
    buffer.fill(0xa, 0, i);

    let slicedBuffer = buffer.slice(0, i);
    uart.send(slicedBuffer, () => {
        setTimeout(send, 100);
    });


    i++;
    if (i >= maxLength) {
        i = 0;
    }
}
send();