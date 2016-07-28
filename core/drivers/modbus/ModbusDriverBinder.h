#include <nan.h>
#include <uv.h>
#include <thread>
#include "ModbusClientSwitzerland.h"

using namespace std;
using v8::Local;
using v8::FunctionTemplate;
using v8::Object;
using v8::Value;
using v8::Handle;
using v8::Isolate;
using v8::Exception;


class ModbusDriverBinder : public Nan::ObjectWrap {

public:
    static void Init(Local<Object> exports);
    static void New(const Nan::FunctionCallbackInfo<Value> &args);
    ModbusDriverBinder();

    ModbusCallbackData *modbusCallbackData;

private:
    ~ModbusDriverBinder();

    static void registerCoilReadingFunction(const Nan::FunctionCallbackInfo<Value> &args);
    ModbusClientSW* modbusClient;

    void registerCoilReading(unsigned char slaveAddress, short functionAddress);

    static void listenAsyncStart(uv_work_t *req);
    static void listenAsyncEvent(uv_async_t* handle);
    static void listenAsyncFinished(uv_work_t *req, int status);


    uv_async_t asyncCoilReading;
    uv_work_t reqCoilReading;
    uv_async_t asyncRegisterReading;

    thread listenThread;
};

NODE_MODULE(ModbusDriverBinder, ModbusDriverBinder::Init)