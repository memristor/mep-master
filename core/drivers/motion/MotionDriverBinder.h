#include <nan.h>
#include "MotionDriver.h"
#include "Point2D.h"

using motion::MotionDriver;
using geometry::Point2D;
using v8::Local;
using v8::FunctionTemplate;
using v8::Object;
using v8::Value;
using v8::Handle;
using v8::Isolate;
using v8::Exception;
using namespace std;

class MotionDriverBinder : public Nan::ObjectWrap {
public:
    static void Init(Local<Object> exports);
    MotionDriver *getMotionDriver() { return motionDriver; };

private:
    static void New(const Nan::FunctionCallbackInfo<Value> &args);
    MotionDriverBinder(Point2D initPosition = Point2D(),
                           MotionDriver::RobotType robotType = MotionDriver::VELIKI,
                           int initOrientation=0,
                           int initSpeed=100);
    static void moveToPosition(const Nan::FunctionCallbackInfo<Value> &args);

    MotionDriver *motionDriver;
};

NODE_MODULE(MotionDriverBinder, MotionDriverBinder::Init)