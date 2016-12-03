#include <nan.h>
#include "MotionDriver.h"
#include "Point2D.h"
#include "Log.h"

using motion::MotionDriver;
using geometry::Point2D;
using v8::Local;
using v8::FunctionTemplate;
using v8::Object;
using v8::Value;
using v8::Handle;
using v8::Isolate;
using v8::Exception;
using v8::Array;
using v8::Integer;
using namespace Nan;
using namespace std;

// `refreshData()` should be async
// More details about async function implementation in Node.js:
// https://blog.scottfrees.com/c-processing-from-node-js-part-4-asynchronous-addons
// https://nikhilm.github.io/uvbook/threads.html
// http://stackoverflow.com/questions/36987273/callback-nodejs-javascript-function-from-multithreaded-c-addon

class MotionDriverBinder : public Nan::ObjectWrap {
public:
    static void Init(Local<Object> exports);
    MotionDriver *getMotionDriver() { return motionDriver; };

private:
    static void New(const Nan::FunctionCallbackInfo<Value> &args);
    MotionDriverBinder(Point2D initPosition = Point2D(),
                           int initOrientation=0,
                           int initSpeed=100);
    static void moveToPosition(const Nan::FunctionCallbackInfo<Value> &args);
    static void stop(const Nan::FunctionCallbackInfo<Value> &args);
    static void moveStraight(const Nan::FunctionCallbackInfo<Value> &args);
	static void setSpeed(const Nan::FunctionCallbackInfo<Value> &args);
	static void getPosition(const Nan::FunctionCallbackInfo<Value> &args);
	static void refreshData(const Nan::FunctionCallbackInfo<Value> &args);
	static void getState(const Nan::FunctionCallbackInfo<Value> &args);

    MotionDriver *motionDriver;
};

NODE_MODULE(MotionDriverBinder, MotionDriverBinder::Init)
