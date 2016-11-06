#include "ModbusDriverBinder.h"

#define TAG "ModbusDriverBinder "

ModbusDriverBinder::ModbusDriverBinder(Callback *callback) {
    modbusClient = ModbusClientSW::getModbusClientInstance();
    Nan::AsyncQueueWorker(new ModbusDataListenerWorker(callback));
}

ModbusDriverBinder::~ModbusDriverBinder() {
    modbusClient->stop();
}

void ModbusDriverBinder::registerCoilReading(unsigned char slaveAddress, short functionAddress) {
    int modbusID = modbusClient->registerCoilReading(slaveAddress, functionAddress, false);
    modbusClient->setReading(modbusID, true);
}

void ModbusDriverBinder::registerCoilReadingFunction(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    // Get params
    if (args.Length() != 2 ||
        args[0]->IsInt32() == false ||
        args[1]->IsInt32() == false) {

        args.GetIsolate()->ThrowException(Exception::TypeError(
            Nan::New("Please check arguments").ToLocalChecked()
        ));
    }

    unsigned char slaveAddress = (unsigned char)args[0]->Int32Value();
    short functionAddress = (short)args[1]->Int32Value();

    ModbusDriverBinder *modbusDriver = ObjectWrap::Unwrap<ModbusDriverBinder>(args.Holder());
    modbusDriver->registerCoilReading(slaveAddress, functionAddress);
}

void ModbusDriverBinder::Init(Local<Object> exports) {
    Nan::HandleScope scope;

	// Set Node/v8 stuff
    Local<FunctionTemplate> tmpl = Nan::New<FunctionTemplate>(New);
    tmpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tmpl, "registerCoilReading", registerCoilReadingFunction);

    exports->Set(Nan::New("ModbusDriverBinder").ToLocalChecked(), tmpl->GetFunction());
}

void ModbusDriverBinder::New(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    if (args.Length() != 2 ||
        args[0]->IsBoolean() == false ||
        args[1]->IsFunction() == false) {

        args.GetIsolate()->ThrowException(Exception::TypeError(
            Nan::New("Constructor prototype is (boolean log, function progressCallback").ToLocalChecked()
        ));
    }

    // Set log level
    el::Configurations defaultConf;
    defaultConf.setToDefault();
    defaultConf.setGlobally(el::ConfigurationType::ToFile, "false");
    defaultConf.setGlobally(el::ConfigurationType::Format, "%datetime %level %msg");
    defaultConf.setGlobally(el::ConfigurationType::Enabled, args[0]->BooleanValue() ? "true" : "false");
    defaultConf.set(el::Level::Warning, el::ConfigurationType::Enabled, "true");
    defaultConf.set(el::Level::Error, el::ConfigurationType::Enabled, "true");
    el::Loggers::reconfigureLogger("default", defaultConf);

    // Apply arguments
    Callback *callback = new Callback(args[1].As<v8::Function>());

    ModbusDriverBinder *modbusDriverBinder = new ModbusDriverBinder(callback);
    modbusDriverBinder->Wrap(args.This());


    // Return object
    args.GetReturnValue().Set(args.This());
}
