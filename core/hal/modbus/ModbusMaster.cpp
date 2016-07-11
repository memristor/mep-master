#include "ModbusMaster.h"

//#define DELAY_TIME 150
//#define xBlockTime 200

namespace modbus {

ModbusMaster::ModbusMaster(speed_t baudRate):rs485(true, baudRate)
{}

unsigned char ModbusMaster::ModbusAccumulate(unsigned char *data, int data_size)
{
	int i;
	unsigned long LRC = (unsigned char)0;

	if(data == 0)
	{
		return -1;
	}

	for (i = 0; i < data_size; i++)
	{
		LRC += data[i];
	}

	return LRC;
}

int ModbusMaster::ModbusByteToASCII(unsigned char Byte, signed char *Nibble1, signed char *Nibble2)
{
	if( (Nibble1 == 0) || (Nibble2 == 0) )
	{
		return -1;
	}

	*Nibble1 = (Byte >> 4) + 48;
	*Nibble2 = (Byte & 0x0F) + 48;

	if(*Nibble1 > 57)
	{
		*Nibble1 += 7;
	}
	if(*Nibble2 > 57)
	{
		*Nibble2 += 7;
	}

	return 1;
}

int ModbusMaster::ModbusASCIIToByte(unsigned char *Byte, signed char Nibble1, signed char Nibble2)
{
	if(Byte == 0)
	{
		return -1;
	}

	if(Nibble1 > 57)
	{
		Nibble1 -= 7;
	}
	if(Nibble2 > 57)
	{
		Nibble2 -= 7;
	}

	Nibble1 -= 48;
	Nibble2 -= 48;
	Nibble1 = Nibble1 << 4;
	*Byte = Nibble1 | Nibble2;

	return 1;
}

int ModbusMaster::ModbusAsciify(unsigned char *byteMessage, signed char *asciiMessage, int byteMessageSize)
{
	int i;

	if((byteMessage == 0) || (asciiMessage == 0))
	{
		return -1;
	}

	for(i=0; i<byteMessageSize; i++)
	{
		ModbusByteToASCII(byteMessage[i], &asciiMessage[i*2], &asciiMessage[i*2+1]);
	}

	return byteMessageSize*2;
}

bool ModbusMaster::ModbusGetStartChar()
{
	unsigned char attempts = 30;
	signed char c;

    //usleep(1*1000);
    usleep(1*1000); // TOME EDIT

	while(attempts > 0 && rs485.getChar((char*)&c) > 0)
	{
		if(c == ':')
		{
			return true;
		}
		else
		{
            //if(c!=0) printf("wrong start char c=%c, hex=%x \n", c, c);  TOME
//			else printf("wrong start char c=NULL\n");
		}
		attempts--;
	}
    //printf("didn't get start char, after attempts=%d\n", 30-attempts);
	return false;
}

unsigned long ModbusMaster::calculateLRC(int sum)
{
	return (unsigned char)((((unsigned char)sum)^0xFF)+1);
}

//send single register
bool ModbusMaster::ModbusPresetSingleRegister(unsigned char slave_address, unsigned short address, short data)
{
	unsigned char byteMessage[6];
	signed char asciiMessage[17];
	signed char asciiMessageRecive[17];
	unsigned long LRC;
	int i;

	byteMessage[0] = slave_address;
	byteMessage[1] = 6;
	byteMessage[2] = address >> 8;
	byteMessage[3] = address & 0xFF;
	byteMessage[4] = data >> 8;
	byteMessage[5] = data & 0xFF;
	asciiMessage[0] = ':';
	ModbusAsciify(byteMessage, &asciiMessage[1], 6);
	LRC = ModbusAccumulate(byteMessage, 6);
	LRC = calculateLRC(LRC);
	ModbusByteToASCII(LRC, &asciiMessage[13], &asciiMessage[14]);
	asciiMessage[15] = '\r';
	asciiMessage[16] = '\n';

	rs485.putString((const char *)asciiMessage, 17);

	if(!ModbusGetStartChar())
	{
		return false;
	}

	asciiMessageRecive[0] = ':';

	if(rs485.getString((char*)&asciiMessageRecive[1], 16) != 16)
	{
		return false;
	}

	for(i=0; i<17; i++)
	{
		if(asciiMessage[i] != asciiMessageRecive[i])
		{
			return false;
		}
	}

	return true;
}

//send single register
bool ModbusMaster::ModbusForceSingleCoil(unsigned char slave_address, unsigned short address, signed char data)
{
	unsigned char byteMessage[6];
	signed char asciiMessage[17];
	signed char asciiMessageRecive[17];
	unsigned long LRC;
	int i;

	byteMessage[0] = slave_address;
	byteMessage[1] = 5;
	byteMessage[2] = address >> 8;
	byteMessage[3] = address & 0xFF;
	byteMessage[4] = data?0xFF:0x00;
	byteMessage[5] = 0x00;
	asciiMessage[0] = ':';
	ModbusAsciify(byteMessage, &asciiMessage[1], 6);
	LRC = ModbusAccumulate(byteMessage, 6);
	LRC = calculateLRC(LRC);
	ModbusByteToASCII(LRC, &asciiMessage[13], &asciiMessage[14]);
	asciiMessage[15] = '\r';
	asciiMessage[16] = '\n';

	rs485.putString((const char *)asciiMessage, 17);

	if(!ModbusGetStartChar())
	{
		return false;
	}

	asciiMessageRecive[0] = ':';

	rs485.getString((char*)&asciiMessageRecive[1], 16);

	for(i=0; i<17; i++)
	{
		if(asciiMessage[i] != asciiMessageRecive[i])
		{
			printf("modbus return message fault, should be hex=%x, actualy is hex=%x\n", asciiMessage[i], asciiMessageRecive[i]);
			return false;
		}
	}
	return true;
}

//send multiple register
bool ModbusMaster::ModbusPresetMultipleRegs(unsigned char slave_address, unsigned short address, unsigned short quantity, short *data)
{
	unsigned char byteMessage[7];
	signed char asciiMessage[50];
	signed char asciiMessageRecive[17];
	unsigned long LRC;
	int i;
	unsigned char *data_p = (unsigned char*)data;

	byteMessage[0] = slave_address;
	byteMessage[1] = 16;
	byteMessage[2] = address >> 8;
	byteMessage[3] = address & 0xFF;
	byteMessage[4] = quantity >> 8;
	byteMessage[5] = quantity & 0xFF;
	byteMessage[6] = (signed char)quantity*2;

	LRC = ModbusAccumulate(byteMessage, 7);

	asciiMessage[0] = ':';
	ModbusAsciify(byteMessage, &asciiMessage[1], 7);
	for(i = 0; i < quantity; i++)
	{
		ModbusByteToASCII((data[i]>>8)  , &asciiMessage[15+i*4], &asciiMessage[16+i*4]);
		ModbusByteToASCII((data[i]&0xFF), &asciiMessage[17+i*4], &asciiMessage[18+i*4]);
		LRC += (unsigned char)*data_p;
		LRC += (unsigned char)*(data_p+1);
		data_p += 2;
	}
	LRC = calculateLRC(LRC);
	ModbusByteToASCII(LRC, &asciiMessage[15+quantity*4], &asciiMessage[16+quantity*4]);
	asciiMessage[17+quantity*4] = '\r';
	asciiMessage[18+quantity*4] = '\n';

	rs485.putString((const char *)asciiMessage, 19+quantity*4);

	if(!ModbusGetStartChar())
	{
		return false;
	}
	asciiMessageRecive[0] = ':';

	rs485.getString((char*)&asciiMessageRecive[1], 16);

	for(i = 0; i < 13; i++)
	{
		if(asciiMessage[i] != asciiMessageRecive[i])
		{
			return false;
		}
	}
	// LRC provera dolazne poruke
	return true;
}

bool ModbusMaster::ModbusForceMultipleCoils(unsigned char slave_address, unsigned short address, unsigned short quantity, unsigned char *data)
{
	unsigned char byteMessage[7];
	unsigned char byte;
	signed char asciiMessage[50];
	signed char asciiMessageRecive[17];
	unsigned long LRC, receivedLRC;
	int i;
	int bytesToSend;

	byteMessage[0] = slave_address;
	byteMessage[1] = 15;
	byteMessage[2] = address >> 8;
	byteMessage[3] = address & 0xFF;
	byteMessage[4] = quantity >> 8;
	byteMessage[5] = quantity & 0xFF;
	bytesToSend = quantity>>3;
	if(quantity%8 != 0)
	{
		bytesToSend++;
	}
	byteMessage[6] = (signed char)bytesToSend;
	asciiMessage[0] = ':';
	ModbusAsciify(byteMessage, &asciiMessage[1], 7);
	LRC = ModbusAccumulate(byteMessage, 7);

	byte = 0;
	for(i = 0; i < quantity; i++)
	{
		if(data[i])
		{
			byte |= 1<<(i%8);
		}
		if((i+1)%8 == 0)
		{
			ModbusByteToASCII(byte, &asciiMessage[15+(i>>2)], &asciiMessage[16+(i>>2)]);
			LRC += byte;
			byte = 0;
		}
	}
	if(i%8 != 0)
	{
		ModbusByteToASCII(byte, &asciiMessage[15+(i>>2)], &asciiMessage[16+(i>>2)]);
		LRC += byte;
		byte = 0;
	}

	LRC = calculateLRC(LRC);
	ModbusByteToASCII(LRC, &asciiMessage[15+bytesToSend*2], &asciiMessage[16+bytesToSend*2]);
	asciiMessage[17+bytesToSend*2] = '\r';
	asciiMessage[18+bytesToSend*2] = '\n';

	rs485.putString((const char *)asciiMessage, 19+bytesToSend*2);

	if(!ModbusGetStartChar())
	{
		return false;
	}
	asciiMessageRecive[0] = ':';

	rs485.getString((char*)&asciiMessageRecive[1], 16);

	ModbusASCIIToByte((unsigned char*)&receivedLRC, asciiMessageRecive[13], asciiMessageRecive[14]);

	LRC = 0;
	for(i = 0; i < 6; i++)
	{
		ModbusASCIIToByte(&byteMessage[0], asciiMessageRecive[1+i*2], asciiMessageRecive[2+i*2]);
		LRC += byteMessage[0];
	}
	LRC = calculateLRC(LRC);
	// provera ostatka dolazne poruke

	if(LRC != receivedLRC)
	{
		return false;
	}

	return true;
}

bool ModbusMaster::ModbusReadCoilStatus(unsigned char slave_address, unsigned short address, unsigned short quantity, signed char *data)
{
	unsigned char byteMessage[6];
	signed char asciiMessage[17];
	signed char asciiMessageRecive[50];
	int byteReceived;
	unsigned long LRC;
	unsigned char receivedLRC;
	int i, j;

	byteMessage[0] = slave_address;
	byteMessage[1] = 1;
	byteMessage[2] = address >> 8;
	byteMessage[3] = address & 0xFF;
	byteMessage[4] = quantity >> 8;
	byteMessage[5] = quantity & 0xFF;
	asciiMessage[0] = ':';
	ModbusAsciify(byteMessage, &asciiMessage[1], 6);
	LRC = ModbusAccumulate(byteMessage, 6);
	LRC = calculateLRC(LRC);
	ModbusByteToASCII(LRC, &asciiMessage[13], &asciiMessage[14]);
	asciiMessage[15] = '\r';
	asciiMessage[16] = '\n';

	byteReceived = quantity>>3;
	if(quantity%8 != 0)
	{
		byteReceived++;
	}

	rs485.putString((const char *)asciiMessage, 17);

	if(!ModbusGetStartChar())
	{
		return false;
	}
	asciiMessageRecive[0] = ':';

	rs485.getString((char*)&asciiMessageRecive[1], 10+2*byteReceived);

	ModbusASCIIToByte(&byteMessage[0], asciiMessageRecive[1], asciiMessageRecive[2]);
	ModbusASCIIToByte(&byteMessage[1], asciiMessageRecive[3], asciiMessageRecive[4]);
	ModbusASCIIToByte(&byteMessage[2], asciiMessageRecive[5], asciiMessageRecive[6]);
	LRC = ModbusAccumulate(byteMessage, 3);

	unsigned char packed_byte;
	for(i = 0; i < (int)byteMessage[2]; i++)
	{
		ModbusASCIIToByte(&packed_byte, asciiMessageRecive[7+i*2], asciiMessageRecive[8+i*2]);
		LRC += packed_byte;
		for(j = 0; j < 8; j++)
		{
			if(i*8+j > quantity)
			{
				break;
			}
			if(packed_byte&(1<<j))
			{
				data[i*8+j] = 1;
			}
			else
			{
				data[i*8+j] = 0;
			}
		}
	}

	ModbusASCIIToByte(&receivedLRC, asciiMessageRecive[7+2*byteReceived], asciiMessageRecive[8+2*byteReceived]);
	LRC = calculateLRC(LRC);
	if(LRC != receivedLRC)
	{
		return false;
	}

	return true;
}

//receive multiple register
bool ModbusMaster::ModbusReadHoldingRegisters(unsigned char slave_address, unsigned short address, unsigned short quantity, short *data)
{
	unsigned char byteMessage[16];
	signed char asciiMessage[17];
	signed char asciiMessageRecive[50];
	unsigned long LRC;
	unsigned char receivedLRC;
	int i;
	unsigned char *pData;

	byteMessage[0] = slave_address;
	byteMessage[1] = 3;
	byteMessage[2] = address >> 8;
	byteMessage[3] = address & 0xFF;
	byteMessage[4] = quantity >> 8;
	byteMessage[5] = quantity & 0xFF;
	asciiMessage[0] = ':';
	ModbusAsciify(byteMessage, &asciiMessage[1], 6);
	LRC = ModbusAccumulate(byteMessage, 6);
	LRC = calculateLRC(LRC);
	ModbusByteToASCII(LRC, &asciiMessage[13], &asciiMessage[14]);
	asciiMessage[15] = '\r';
	asciiMessage[16] = '\n';

	rs485.putString((const char *)asciiMessage, 17);

	if(!ModbusGetStartChar())
	{
		return false;
	}
	asciiMessageRecive[0] = ':';

	if(rs485.getString((char*)&asciiMessageRecive[1], 10+4*quantity) != 10+4*quantity)
	{
		return false;
	}

	ModbusASCIIToByte(&byteMessage[0], asciiMessageRecive[1], asciiMessageRecive[2]);
	if(byteMessage[0] != slave_address)
	{
		return false;
	}
	ModbusASCIIToByte(&byteMessage[1], asciiMessageRecive[3], asciiMessageRecive[4]);
	if(byteMessage[1] != 3)
	{
		return false;
	}
	ModbusASCIIToByte(&byteMessage[2], asciiMessageRecive[5], asciiMessageRecive[6]);
	if(byteMessage[2] != quantity*2)
	{
		return false;
	}
	LRC = ModbusAccumulate(byteMessage, 3);

	pData = (unsigned char *)data;
	for(i = 0; i < (int)quantity; i++)
	{
		ModbusASCIIToByte(&pData[i*2+1], asciiMessageRecive[7+i*4], asciiMessageRecive[8+i*4]);
		ModbusASCIIToByte(&pData[i*2], asciiMessageRecive[9+i*4], asciiMessageRecive[10+i*4]);
		LRC += pData[i*2+1];
		LRC += pData[i*2];
	}
	LRC = calculateLRC(LRC);

	ModbusASCIIToByte(&receivedLRC, asciiMessageRecive[7+quantity*4], asciiMessageRecive[8+quantity*4]);

	if(LRC != receivedLRC)
	{
		printf("LRC=%d, receivedLRC=%d\n", LRC, receivedLRC);
		return false;
	}

	return true;
}

ModbusMaster* ModbusMaster::getModbusInstance(){
    if (!instance){
        instance = new ModbusMaster(B115200);
    }
    return instance;
}

ModbusMaster *ModbusMaster::instance = 0;

}
