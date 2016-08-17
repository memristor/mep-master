/*
 * Uart.cpp
 *
 *  Created on: Nov 7, 2013
 *      Author: LaptopX
 */

#include "UartConnection.h"
#include <unistd.h>			//Used for UART
#include <fcntl.h>			//Used for UART
#include <cstdio>

namespace uart
{

UartConnection::UartConnection(bool openNow, speed_t baudRate):baudRate(baudRate)
{
	uart0_filestream = -1;
	if(openNow) openUart();
}

UartConnection::~UartConnection()
{
	closeUart();
}

void UartConnection::openUart()
{
	//-------------------------
	//----- SETUP USART 0 -----
	//-------------------------
	//At bootup, pins 8 and 10 are already set to UART0_TXD, UART0_RXD (ie the alt0 function) respectively

	//OPEN THE UART
	//The flags (defined in fcntl.h):
	//	Access modes (use 1 of these):
	//		O_RDONLY - Open for reading only.
	//		O_RDWR - Open for reading and writing.
	//		O_WRONLY - Open for writing only.
	//
	//	O_NDELAY / O_NONBLOCK (same function) - Enables nonblocking mode. When set read requests on the file can return immediately with a failure status
	//											if there is no input immediately available (instead of blocking). Likewise, write requests can also return
	//											immediately with a failure status if the output can't be written immediately.
	//
	//	O_NOCTTY - When set and path identifies a terminal device, open() shall not cause the terminal device to become the controlling terminal for the process.
	uart0_filestream = open("/dev/ttyAMA0", O_RDWR | O_NOCTTY | O_NDELAY);		//Open in non blocking read/write mode
	if (uart0_filestream == -1)
	{
		//ERROR - CAN'T OPEN SERIAL PORT
	}

	//CONFIGURE THE UART
	//The flags (defined in /usr/include/termios.h - see http://pubs.opengroup.org/onlinepubs/007908799/xsh/termios.h.html):
	//	Baud rate:- B1200, B2400, B4800, B9600, B19200, B38400, B57600, B115200, B230400, B460800, B500000, B576000, B921600, B1000000, B1152000, B1500000, B2000000, B2500000, B3000000, B3500000, B4000000
	//	CSIZE:- CS5, CS6, CS7, CS8
	//	CLOCAL - Ignore modem status lines
	//	CREAD - Enable receiver
	//	IGNPAR = Ignore characters with parity errors
	//	ICRNL - Map CR to NL on input (Use for ASCII comms where you want to auto correct end of line characters - don't use for bianry comms!)
	//	PARENB - Parity enable
	//	PARODD - Odd parity (else even)
	struct termios options;
	tcgetattr(uart0_filestream, &options);
	options.c_cflag = baudRate | CS8 | CLOCAL | CREAD;		//<Set baud rate
	options.c_iflag = IGNPAR;
	options.c_oflag = 0;
	options.c_lflag = 0;
	tcflush(uart0_filestream, TCIFLUSH);
	tcsetattr(uart0_filestream, TCSANOW, &options);
	
	// flushuj na pocetku
	flushInput();
	flushOutput();
	
	dumpReadGarbage();
}

void UartConnection::dumpReadGarbage()
{
	char dump;
	while(readUart(&dump, 1))
	{
		printf("garbage detected = %x\n", dump);
	}
}

void UartConnection::closeUart()
{
	close(uart0_filestream);
	uart0_filestream=-1;
}

void UartConnection::writeUart(const char *data, int dataSize)
{
	if (uart0_filestream != -1)
	{
		int count = write(uart0_filestream, data, dataSize);		//Filestream, bytes to write, number of bytes to write
		if (count < 0)
		{
			//printf("UART TX error\n");
		}
	}
}

void UartConnection::writeUart(const char &data)
{
	writeUart(&data, 1);
}

void UartConnection::readAll(char output[], int numOfBytes)
{
	int currentByte=0;
	int printCont=0;
	int retryCount=0;

    while(true)
	{
        if (retryCount>=5){
            throw "UART not available";
        }
		currentByte += readUart(output+currentByte, numOfBytes-currentByte);
		if(currentByte >= numOfBytes) break;
		printCont++;
		if((printCont%200)==0) printf("uart readAll spin, retryCount=%d\n", (retryCount++)*200);
		usleep(5*1000);
	}
	// TODO ubaciti vremenski uslov da se ne zaglavi u while vecno
}

int UartConnection::readUart(char output[], int numOfBytes)
{
	//----- CHECK FOR ANY RX BYTES -----
	if (uart0_filestream != -1)
	{
		int rx_length = read(uart0_filestream, (void*)output, numOfBytes);		//Filestream, buffer to store in, number of bytes to read (max)
		if (rx_length < 0)
		{
			//An error occured (will occur if there are no bytes)
		}
		else if (rx_length == 0)
		{
			//No data waiting
		}
		else
		{
			//Bytes received
			return rx_length;
		}
	}

	return 0;
}

void UartConnection::readUart(char &data)
{
	readUart(&data, 1);
}

void UartConnection::flushInput()
{
	tcflush(uart0_filestream, TCIFLUSH);
}

void UartConnection::flushOutput()
{
	tcflush(uart0_filestream, TCOFLUSH);
}

// TODO kad se desi greska da se proba flushovati ili zatvoriti pa otvoriti uart

}
