#ifndef MODBUSMASTER_H_
#define MODBUSMASTER_H_

#include "rs485.h"

class ModbusMaster {
private:


    unsigned char ModbusAccumulate(unsigned char *data, int data_size);
    int ModbusByteToASCII(unsigned char Byte, signed char *Nibble1, signed char *Nibble2);
    int ModbusASCIIToByte(unsigned char *Byte, signed char Nibble1, signed char Nibble2);
    int ModbusAsciify(unsigned char *byteMessage, signed char *asciiMessage, int byteMessageSize);
    bool ModbusGetStartChar();
    unsigned long calculateLRC(int sum);
    ModbusMaster(speed_t baudRate = B115200);

public:
    rs485Connection rs485;

    static ModbusMaster* getModbusInstance();
    static ModbusMaster* instance;

    bool ModbusForceSingleCoil(unsigned char slave_address, unsigned short address, signed char data);
    bool ModbusReadCoilStatus(unsigned char slave_address, unsigned short address, unsigned short quantity, signed char *data);
    bool ModbusForceMultipleCoils(unsigned char slave_address, unsigned short address, unsigned short quantity, unsigned char *data);

    bool ModbusPresetSingleRegister(unsigned char slave_address, unsigned short address, short data);
    bool ModbusPresetMultipleRegs(unsigned char slave_address, unsigned short address, unsigned short quantity, short *data);
    bool ModbusReadHoldingRegisters(unsigned char slave_address, unsigned short address, unsigned short quantity, short *data);
};

#endif /* MODBUSMASTER_H_ */
