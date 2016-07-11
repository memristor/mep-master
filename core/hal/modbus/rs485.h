
#ifndef UART1CONNECTION_H_
#define UART1CONNECTION_H_

#include <stdio.h>   /* included for printf() */
#include <fcntl.h>   /* included for O_RDWR, O_NOCTTY and O_NDELAY */
#include <termios.h> /* included for functions and defines used in set_interface_attribs */
#include <unistd.h>  /* included for function write() */
#include <string.h>  /* included for memset */

//int set_interface_attribs(int fd, int speed, int parity);

#define RS485_DEVICE "/dev/ttyRPC0"

//namespace uart1
//{

class rs485Connection {
private:
    int fd;
public:
    speed_t baudRate;
public:
    rs485Connection(bool openNow = true, speed_t baudRate = B115200);
    virtual ~rs485Connection();
    int  openUart();
    void closeUart();
    void putString(const char *data, int dataSize);
    void putChar(const char &data);
    int  getString(char output[], int numOfBytes);
    int  getChar(char *data);
};

//}
#endif /* UART1CONNECTION_H_ */
