/** @namespace misc.protocols */

/**
 * Packetized Low-Level Secured Protocol
 * @memberof misc.protocols
 * <pre>
 * 0                   1                   2                   3
 * 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +--------------+-------+-------+---------------+----------------+
 * |  Start Byte  | Header|Payload|  Packet type  | Payload length |
 * |    (0x3C)    |    Checksum   |               |                |
 * +-------------------------------- - - - - - - - - - - - - - - - +
 * :                     Payload Data continued ...                :
 * + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 * |                     Payload Data continued ...                |
 * +---------------------------------------------------------------+
 * </pre>
 */
class PLLSP {
    static get STATE_READ_HEADER() { return 0; }
    static get STATE_READ_PAYLOAD() { return 1; }
    static get STATE_WAIT_START() { return 2; }

    constructor(config) {
        this.config = Object.assign({
            bufferSize: 150,
            onDataCallback: () => { }
        }, config);

        this._buffer = Buffer.alloc(this.config.bufferSize);
        this._bufferSize = 0;
        this._state = PLLSP.STATE_WAIT_START;

        this._headerChecksum = 0;
        this._payloadChecksum = 0;
        this._payloadLength = 0;
        this._packetType = 0;
        this._startByteIndex = 0;
    }

    generate(buffer, type) {
        if (type === undefined || type === null) {
            type = 'U'.charCodeAt(0);
        }

        let packet = Buffer.allocUnsafe(buffer.length + 4);

        // Copy payload
        buffer.copy(packet, 4);

        // Set start byte
        packet.writeUInt8(0x3C, 0);

        // Set checksum
        let headerChecksum = buffer.length + type;
        let payloadChecksum = 0;
        for (let i = 0; i < buffer.length; i++) {
            payloadChecksum += buffer.readUInt8(i);
        }
        packet.writeUInt8(((headerChecksum & 0x0F) << 4) | (payloadChecksum & 0x0F), 1);

        // Set packet type
        packet.writeUInt8(type, 2);

        // Set length
        packet.writeUInt8(buffer.length, 3);

        return packet;
    }

    push(chunkBuffer) {
        // Append `tempBuffer` to `buffer`
        if (chunkBuffer !== null) {
            if (chunkBuffer.length + this._bufferSize < this._buffer.length) {
                chunkBuffer.copy(this._buffer, this._bufferSize);
                this._bufferSize += chunkBuffer.length;
            } else {
                // To much junk, delete whole buffer
                chunkBuffer.copy(this._buffer, 0);
                this._bufferSize = chunkBuffer.length;
                this._state = PLLSP.STATE_WAIT_START
            }
        }

        // Try to find start byte and start pumping a packet with data
        if (this._state === PLLSP.STATE_WAIT_START) {
            this._startByteIndex = this._buffer.indexOf(0x3C);
            if (this._startByteIndex >= 0 && this._startByteIndex < this._bufferSize) {
                this._state = PLLSP.STATE_READ_HEADER;
            }
        }

        // Try to read a header
        if (this._state === PLLSP.STATE_READ_HEADER) {
            if (this._bufferSize - this._startByteIndex >= 4) {
                // Extract header from packet
                this._headerChecksum = (this._buffer.readUInt8(this._startByteIndex + 1) & 0xF0) >> 4;
                this._payloadChecksum = this._buffer.readUInt8(this._startByteIndex + 1) & 0x0F;
                this._packetType = this._buffer.readUInt8(this._startByteIndex + 2);
                this._payloadLength = this._buffer.readUInt8(this._startByteIndex + 3);

                // Check header checksum
                if (((this._payloadLength + this._packetType) & 0x0F) !== this._headerChecksum ||
                    this._payloadLength + 4 + this._startByteIndex >= this._buffer.length) {
                    this._bufferSize -= 1;
                    this._buffer.copy(this._buffer, 0, this._startByteIndex + 1, this._bufferSize + this._startByteIndex + 1);
                    this._state = PLLSP.STATE_WAIT_START;
                } else {
                    this._state = PLLSP.STATE_READ_PAYLOAD;
                }
            }
        }

        // Read the payload
        if (this._state === PLLSP.STATE_READ_PAYLOAD) {
            if (this._bufferSize - this._startByteIndex >= this._payloadLength + 4) {
                // Check payload checksum and if it is OK send event
                let generatedPayloadChecksum = 0;
                for (let i = 0; i < this._payloadLength; i++) {
                    generatedPayloadChecksum += this._buffer.readUInt8(i + 4 + this._startByteIndex);
                }
                if ((generatedPayloadChecksum & 0x0F) === this._payloadChecksum) {
                    let packetPayload = Buffer.allocUnsafe(this._payloadLength);
                    this._buffer.copy(packetPayload, 0, this._startByteIndex + 4, this._startByteIndex + this._payloadLength + 4);

                    this.config.onDataCallback(packetPayload, this._packetType);

                    // Prepare for next packet
                    this._bufferSize -= (this._payloadLength + 4);
                    this._buffer.copy(
                        this._buffer,
                        0,
                        this._startByteIndex + this._payloadLength + 4,
                        this._payloadLength + 4 + this._bufferSize);
                } else {
                    this._bufferSize -= 1;
                    this._buffer.copy(this._buffer, 0, this._startByteIndex + 1, this._bufferSize + this._startByteIndex + 1);
                }

                this._state = PLLSP.STATE_WAIT_START;

                // If there is two packets in single chunk try to export it
                this.push(null);
            }
        }
    }
}

module.exports = PLLSP;