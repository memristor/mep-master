/*
 * Uart.h
 *
 *  Created on: Nov 7, 2013
 *      Author: LaptopX
 */

#ifndef UART_H_
#define UART_H_

#include <termios.h>		//Used for UART

namespace uart
{

class UartConnection {
private:
	int uart0_filestream;
	speed_t baudRate;
	void dumpReadGarbage();
public:
	UartConnection(bool openNow = true, speed_t baudRate = B57600);
	virtual ~UartConnection();
	void openUart();
	void closeUart();
	void writeUart(const char *data, int dataSize);
	void writeUart(const char &data);
	int readUart(char output[], int numOfBytes);
	void readUart(char &data);
	void readAll(char output[], int numOfBytes);
	void flushInput();
	void flushOutput();
};

}

#endif /* UART_H_ */
