#include "ModbusDriverBinder.h"

ModbusDriverBinder::ModbusDriverBinder() {
    modbusClient = ModbusClientSW::getModbusClientInstance();

    ModbusReqData *modbusReqData = new ModbusReqData();
    modbusReqData->asyncReading = &asyncCoilReading;
    modbusReqData->modbusCallbackData = modbusCallbackData;
    reqCoilReading.data = (void *)modbusReqData;

    uv_async_init(uv_default_loop(), &asyncCoilReading, ModbusDriverBinder::listenAsyncEvent);
    uv_queue_work(uv_default_loop(), &reqCoilReading, ModbusDriverBinder::listenAsyncStart, ModbusDriverBinder::listenAsyncFinished);

    //listenThread = thread(&ModbusClientSW::main, modbusClient, &asyncCoilReading, modbusCallbackData);
}

void ModbusDriverBinder::listenAsyncStart(uv_work_t *req) {
    ModbusClientSW::getModbusClientInstance()->main(&asyncCoilReading, ());
}

void ModbusDriverBinder::listenAsyncFinished(uv_work_t *req, int status) {
    uv_close((uv_handle_t*) &asyncCoilReading, nullptr);
}

void ModbusDriverBinder::listenAsyncEvent(uv_async_t *handle) {
    cout << "ModbusDriverBinder::callbackCoilFunction()" << endl;

    Nan::HandleScope scope;

    ModbusCallbackData *modbusCallbackData = (ModbusCallbackData *)handle->data;

    // Fire event
    Handle<Value> argv[] = {
        Nan::New("coilChanged").ToLocalChecked(),
        Nan::New(modbusCallbackData->slaveAddress),
        Nan::New(modbusCallbackData->functionAddress),
        Nan::New(modbusCallbackData->detected)
    };

    Nan::MakeCallback(Nan::New(modbusCallbackData->object), "emit", 4, argv);
}



ModbusDriverBinder::~ModbusDriverBinder() {
    delete modbusCallbackData;
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

    Local<FunctionTemplate> tmpl = Nan::New<FunctionTemplate>(New);
    tmpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tmpl, "registerCoilReading", registerCoilReadingFunction);

    exports->Set(Nan::New("ModbusDriverBinder").ToLocalChecked(), tmpl->GetFunction());
}

void ModbusDriverBinder::New(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    // Create object
    ModbusDriverBinder *modbusDriverBinder = new ModbusDriverBinder();
    modbusDriverBinder->Wrap(args.This());
    modbusDriverBinder->modbusCallbackData = new ModbusCallbackData();
    ((modbusDriverBinder->modbusCallbackData)->object).Reset(args.GetIsolate(), args.Holder());

    // Return object
    args.GetReturnValue().Set(args.This());
}
