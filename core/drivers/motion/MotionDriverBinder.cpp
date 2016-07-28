#include "MotionDriverBinder.h"

MotionDriverBinder::MotionDriverBinder(Point2D initPosition,
       MotionDriver::RobotType robotType,
       int initOrientation,
       int initSpeed) {

    motionDriver = new MotionDriver(initPosition, robotType, initOrientation, initSpeed);
}

void MotionDriverBinder::Init(Local<Object> exports) {
    Nan::HandleScope scope;

    Local<FunctionTemplate> tmpl = Nan::New<FunctionTemplate>(New);
    tmpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tmpl, "moveToPosition", moveToPosition);
    Nan::SetPrototypeMethod(tmpl, "stop", stop);
	Nan::SetPrototypeMethod(tmpl, "moveStraight", moveStraight);

    exports->Set(Nan::New("MotionDriverBinder").ToLocalChecked(), tmpl->GetFunction());
}

void MotionDriverBinder::New(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    // Get params
    Point2D initPosition;

    if (args.Length() < 2 ||
        args[0]->IsInt32() == false ||
        args[1]->IsInt32() == false) {

        args.GetIsolate()->ThrowException(Exception::TypeError(
            Nan::New("Constructor requires at least two arguments").ToLocalChecked()
        ));
        return;
    }

    initPosition = Point2D(args[0]->Int32Value(), args[1]->Int32Value());

    // Create object
    MotionDriverBinder *motionDriverBinder = new MotionDriverBinder(initPosition);
    motionDriverBinder->Wrap(args.This());

    args.GetReturnValue().Set(args.This());
}

/*
    Original: MotionDriver::moveToPosition(geometry::Point2D position, MovingDirection direction)

    Params:
        Int32 positionX - Required X coordinate
        Int32 positionY - Required Y coordinate
        Int32 direction - Direction. FORWARD = 1, BACKWARD = -1
*/
void MotionDriverBinder::moveToPosition(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    // Get params
    if (args.Length() != 3 ||
        args[0]->IsInt32() == false ||
        args[1]->IsInt32() == false ||
        args[2]->IsInt32() == false) {

        args.GetIsolate()->ThrowException(Exception::TypeError(
            Nan::New("Please check arguments").ToLocalChecked()
        ));
    }

    MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();

    Point2D position(args[0]->Int32Value(), args[1]->Int32Value());
    MotionDriver::MovingDirection direction = (args[0]->Int32Value() == 1) ? MotionDriver::FORWARD : MotionDriver::BACKWARD;

    motionDriver->moveToPosition(position, direction);
}

/*
    Original: MotionDriver::stop();
*/
void MotionDriverBinder::stop(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();

    motionDriver->stop();
}

void MotionDriverBinder::moveStraight(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

	 if (args.Length() != 1 ||
        args[0]->IsInt32() == false) {
		
		args.GetIsolate()->ThrowException(Exception::TypeError(
            Nan::New("Please check arguments").ToLocalChecked()
        ));
	}

    MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();

    motionDriver->moveStraight(args[0]->Int32Value());
}
