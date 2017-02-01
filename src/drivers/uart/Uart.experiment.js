const Uart = require('./Uart');
const PLLSP = require('../../misc/protocols/PLLSP');


let pllsp = new PLLSP('PLLSP', {});
let uart = new Uart('uart', {
    _protocol: pllsp
});

let j = 0;
uart.on('data', (buffer, type) => {
    if (j++ % 10 === 0) {
        console.log(new Date(), String.fromCharCode(type));
    }
});


const maxLength = 100;
let buffer = Buffer.alloc(maxLength);
let i = 0;

function send() {
    buffer.fill(0xa, 0, i);

    let slicedBuffer = buffer.slice(0, i);
    uart.send(slicedBuffer, () => {
        setTimeout(send, 10);
    });


    i++;
    if (i >= maxLength) {
        i = 0;
    }
}
send();