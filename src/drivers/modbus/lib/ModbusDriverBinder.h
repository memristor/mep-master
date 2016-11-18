#define _ELPP_NO_DEFAULT_LOG_FILE

#include <nan.h>
#include <uv.h>
#include <thread>
#include "ModbusClientSwitzerland.h"
#include "Log.h"

using namespace std;
using v8::Local;
using v8::FunctionTemplate;
using v8::Object;
using v8::Value;
using v8::Handle;
using v8::Isolate;
using v8::Exception;
using Nan::Callback;


class ModbusDataListenerWorker : public Nan::AsyncProgressWorker {
public:
  ModbusDataListenerWorker(Callback *callback)
    : Nan::AsyncProgressWorker(callback) {}

  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress& progress) {
     ModbusClientSW::getModbusClientInstance()->main(progress);
  }

  void HandleProgressCallback(const char *data, size_t size) {
    Nan::HandleScope scope;

    ModbusCallbackData modbusCallbackData = *reinterpret_cast<ModbusCallbackData*>(const_cast<char*>(data));
    v8::Local<v8::Value> argv[] = {
        Nan::New<v8::Integer>(modbusCallbackData.functionAddress),
        Nan::New<v8::Integer>(modbusCallbackData.slaveAddress),
        Nan::New<v8::Integer>(modbusCallbackData.detected)
    };
    callback->Call(3, argv);
  }
};

class ModbusDriverBinder : public Nan::ObjectWrap {

public:
    static void Init(Local<Object> exports);
    static void New(const Nan::FunctionCallbackInfo<Value> &args);
    ModbusDriverBinder(Callback *callback);

    ModbusCallbackData *modbusCallbackData;

private:
    ~ModbusDriverBinder();
    static void registerCoilReadingFunction(const Nan::FunctionCallbackInfo<Value> &args);
    ModbusClientSW* modbusClient;

    void registerCoilReading(unsigned char slaveAddress, short functionAddress);
};

NODE_MODULE(ModbusDriverBinder, ModbusDriverBinder::Init)
