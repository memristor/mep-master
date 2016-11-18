#ifndef _LOG_H
#define _LOG_H

#define LOG_INIT LogType LOG::level = DEBUG;

#include <iostream>
#include <mutex>
#include <sys/time.h>

using namespace std;

enum LogType {
    DEBUG,
    INFO,
    WARN,
    ERROR
};

class LOG {
public:
	static void setLevel(LogType level) { LOG::level = level; };

    LOG() {}
    LOG(LogType type) {
        mtx.lock();
        msglevel = type;

		struct timeval t;
		gettimeofday(&t, NULL);

        operator << (t.tv_sec) <<
			"." << (t.tv_usec / 1000) <<
			(" ["+getLabel(type)+"] ");
    }

    ~LOG() {
        if(opened) {
            cout << endl;
			mtx.unlock();
        }
        opened = false;
    }

    template<class T>
    LOG &operator<<(const T &msg) {
        if(msglevel >= LOG::level) {
            cout << msg;
            opened = true;
        }
        return *this;
    }
private:
	static LogType level;

	mutex mtx;

    bool opened = false;
    LogType msglevel = DEBUG;
    inline string getLabel(LogType type) {
        string label;
        switch(type) {
            case DEBUG: label = "DEBUG"; break;
            case INFO:  label = "INFO "; break;
            case WARN:  label = "WARN "; break;
            case ERROR: label = "ERROR"; break;
        }
        return label;
    }
};

#endif  /* LOG_H */