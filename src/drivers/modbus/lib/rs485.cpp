#include "rs485.h"

#define TAG "RS485 "

rs485Connection::rs485Connection(bool openNow, speed_t baudRate):baudRate(baudRate)
{
	fd = -1;
	if(openNow)
	{
		openUart();
	}
}

rs485Connection::~rs485Connection()
{
	closeUart();
}

int rs485Connection::openUart()
{
    if ( (fd = open(RS485_DEVICE, O_RDWR | O_NOCTTY | O_NDELAY)) < 0 )
    {
        LOG(ERROR) << TAG << "Failed to open " << RS485_DEVICE << ". Possible causes:\n" <<
            "\t1) The raspicomm device driver is not loaded. type 'lsmod' and verify that you 'raspicommrs485'\n" <<
            "\t2) The raspicomm device driver is in use. Is another application using the device driver?\n" <<
            "\t3) Something went wrong when loading the device driver. Type 'dmesg' and check the kernel messages";
        return -1;
    }

    LOG(INFO) << TAG << "Device " << RS485_DEVICE << " opened";

    struct termios tty;
    memset (&tty, 0, sizeof tty);
    if (tcgetattr (fd, &tty) != 0)
    {
        LOG(ERROR) << TAG << "Error using tcgetattr";
        return -2;
    }

    cfsetospeed (&tty, baudRate);
    cfsetispeed (&tty, baudRate);

    tty.c_cflag = (tty.c_cflag & ~CSIZE) | CS8;     // 8-bit chars
    // disable IGNBRK for mismatched speed tests; otherwise receive break
    // as \000 chars
    tty.c_iflag &= ~IGNBRK;         // ignore break signal
    tty.c_lflag = 0;                // no signaling chars, no echo,
                                  // no canonical processing
    tty.c_oflag = 0;                // no remapping, no delays
    tty.c_cc[VMIN]  = 0;            // read doesn't block
    tty.c_cc[VTIME] = 5;            // 0.5 seconds read timeout

    tty.c_iflag &= ~(IXON | IXOFF | IXANY); // shut off xon/xoff ctrl

    tty.c_iflag &= ~(ICRNL | IGNCR); // don't ignore carriage return, don't convert carriage return to line feed

    tty.c_cflag |= (CLOCAL | CREAD);// ignore modem controls,
                                  // enable reading
    tty.c_cflag &= ~(PARENB | PARODD);      // shut off parity
    tty.c_cflag |= 0;
    tty.c_cflag &= ~CSTOPB;
    tty.c_cflag &= ~CRTSCTS;

    if (tcsetattr (fd, TCSANOW, &tty) != 0)
    {
        LOG(ERROR) << TAG << "Error caused by tcsetattr";
        return -3;
    }

    return 1;
}

void rs485Connection::closeUart()
{
	LOG(INFO) << TAG << "Uart closed";
    close(fd);
    fd = -1;
}

void rs485Connection::putString(const char *data, int dataSize)
{
    if (fd != -1)
    {
        int count = write(fd, data, dataSize); //Filestream, bytes to write, number of bytes to write
        if (count < 0)
        {
            LOG(ERROR) << TAG << "Uart TX Error";
        }
    }
}

void rs485Connection::putChar(const char &data)
{
    putString(&data, 1);
}

int rs485Connection::getString(char output[], int numOfBytes)
{
	int rv,i,numOfBytesReceived;
	fd_set set;
	struct timeval timeout;

	FD_ZERO(&set); /* clear the set */
	FD_SET(fd, &set); /* add our file descriptor to the set */

	timeout.tv_sec = 0;
	timeout.tv_usec = 200000;
	numOfBytesReceived = 0;
	if (fd != -1)
	{
		for(i=0; i<20; i++) // pokusa 20 puta
		{
			rv = select(fd + 1, &set, NULL, NULL, &timeout);
			if(rv == -1)
			{
				LOG(ERROR) << TAG << "Select error";
				return -1;
			}
			else if(rv == 0)
			{
//				printf("select timeout in attempt %d \n", i); // a timeout occured
				return numOfBytesReceived;
			}
			else
			{
				//----- CHECK FOR ANY RX BYTES -----
				int rx_length = read(fd, (void*)(output+numOfBytesReceived), numOfBytes-numOfBytesReceived);		//Filestream, buffer to store in, number of bytes to read (max)

				if (rx_length < 0)
				{
					//An error occured (will occur if there are no bytes)
					LOG(ERROR) << TAG << "An error occured (will occur if there are no bytes)";
					return -1;
				}
				else if (rx_length == 0)
				{
					//No data waiting
					LOG(DEBUG) << TAG << "Received " << numOfBytesReceived << " of " << numOfBytes;
				}
				else
				{
					usleep(100);

					numOfBytesReceived += rx_length;
					if(numOfBytes == numOfBytesReceived)
					{
						return numOfBytesReceived;
					}
				}
			}
		}
	}
    return numOfBytesReceived;
}

int rs485Connection::getChar(char *data)
{
    return getString(data, 1);
}

//}
