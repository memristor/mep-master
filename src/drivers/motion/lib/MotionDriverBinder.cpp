#include "MotionDriverBinder.h"

#define TAG "MotionDriverBinder "

LOG_INIT

class AsyncRefreshDataWorker : public Nan::AsyncWorker {
public:
    AsyncRefreshDataWorker(Nan::Callback* callback, MotionDriverBinder* motionDriverBinder) :
        Nan::AsyncWorker(callback),
        motionDriverBinder(motionDriverBinder) { }
    ~AsyncRefreshDataWorker() { }
    void Execute() {
        MotionDriver *motionDriver = motionDriverBinder->getMotionDriver();
        motionDriver->refreshData();

    }
private:
    MotionDriverBinder* motionDriverBinder;
};

MotionDriverBinder::MotionDriverBinder(Point2D initPosition,
       int initOrientation,
       int initSpeed) {

    motionDriver = new MotionDriver(initPosition, initOrientation, initSpeed);
}

void MotionDriverBinder::Init(Local<Object> exports) {
    Nan::HandleScope scope;

	// Set Node/v8 stuff
    Local<FunctionTemplate> tmpl = Nan::New<FunctionTemplate>(New);
    tmpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tmpl, "moveToPosition", moveToPosition);
    Nan::SetPrototypeMethod(tmpl, "stop", stop);
    Nan::SetPrototypeMethod(tmpl, "softStop", softStop);
	Nan::SetPrototypeMethod(tmpl, "moveStraight", moveStraight);
	Nan::SetPrototypeMethod(tmpl, "setSpeed", setSpeed);
	Nan::SetPrototypeMethod(tmpl, "getPosition", getPosition);
	Nan::SetPrototypeMethod(tmpl, "getState", getPosition);
	Nan::SetPrototypeMethod(tmpl, "refreshData", refreshData);
	Nan::SetPrototypeMethod(tmpl, "getData", getData);
	Nan::SetPrototypeMethod(tmpl, "moveArc", moveArc);
	Nan::SetPrototypeMethod(tmpl, "rotateTo", rotateTo);
	Nan::SetPrototypeMethod(tmpl, "finishCommand", finishCommand);

    exports->Set(Nan::New("MotionDriverBinder").ToLocalChecked(), tmpl->GetFunction());
}

void MotionDriverBinder::New(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    // Get params
    Point2D initPosition;

    if (args.Length() != 5 ||
        args[0]->IsBoolean() == false ||
        args[1]->IsInt32() == false ||
        args[2]->IsInt32() == false ||
        args[3]->IsInt32() == false ||
        args[4]->IsInt32() == false) {

        args.GetIsolate()->ThrowException(Exception::TypeError(
            Nan::New("Constructor prototype is (boolean log, int startX, int startY, int startOrientation, int startSpeed)").ToLocalChecked()
        ));
        return;
    }

    // Set log level
    if (args[0]->BooleanValue() == true) {
        LOG::setLevel(INFO);
    } else {
        LOG::setLevel(INFO);
    }

    // Create a starting point
    initPosition = Point2D(args[1]->Int32Value(), args[2]->Int32Value());

    // Create object
    MotionDriverBinder *motionDriverBinder =
        new MotionDriverBinder(
            initPosition,
            args[3]->Int32Value(),
            args[4]->Int32Value()
        );

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
    MotionDriver::MovingDirection direction = (args[2]->Int32Value() == 1) ? MotionDriver::FORWARD : MotionDriver::BACKWARD;

    motionDriver->moveToPosition(position, direction);
}

void MotionDriverBinder::finishCommand(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();
    motionDriver->finishCommand();
}

void MotionDriverBinder::stop(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();
    motionDriver->stop();
}

void MotionDriverBinder::softStop(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();
    motionDriver->softStop();
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

void MotionDriverBinder::setSpeed(const Nan::FunctionCallbackInfo<Value> &args) {
	Nan::HandleScope scope;

	if (args.Length() != 1 ||
        args[0]->IsInt32() == false) {
		
		args.GetIsolate()->ThrowException(Exception::TypeError(
            Nan::New("Please check arguments. Expected arguments: (uint32 speed)").ToLocalChecked()
        ));
	}

    MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();

    motionDriver->setSpeed(args[0]->Int32Value());
}

void MotionDriverBinder::getPosition(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();
    geometry::Point2D point = motionDriver->getPosition();

    Local<Array> nodes = Array::New(args.GetIsolate());
    nodes->Set(0, Integer::New(args.GetIsolate(), point.getX()));
    nodes->Set(1, Integer::New(args.GetIsolate(), point.getY()));
    args.GetReturnValue().Set(nodes);
}

void MotionDriverBinder::getData(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();

    // Prepare data object
    Local<Object> jsData = Nan::New<Object>();

    // Push position to data object
    geometry::Point2D point = motionDriver->getPosition();
    Local<Object> jsDataPosition = Nan::New<Object>();
    jsDataPosition->Set(Nan::New<v8::String>("x").ToLocalChecked(), Nan::New<v8::Number>(point.getX()));
    jsDataPosition->Set(Nan::New<v8::String>("y").ToLocalChecked(), Nan::New<v8::Number>(point.getY()));
    jsData->Set(Nan::New<v8::String>("position").ToLocalChecked(), jsDataPosition);

    // Push orientation to data object
    int orientation = motionDriver->getOrientation();
    jsData->Set(Nan::New<v8::String>("orientation").ToLocalChecked(), Nan::New<v8::Number>(orientation));

    // Push state to data object
    MotionDriver::State state = motionDriver->getState();
    jsData->Set(Nan::New<v8::String>("state").ToLocalChecked(), Nan::New<v8::Number>(state));

    // Push speed to data object
    int speed = motionDriver->getSpeed();
    jsData->Set(Nan::New<v8::String>("speed").ToLocalChecked(), Nan::New<v8::Number>(speed));

    // Push direction to data object
    int direction = motionDriver->getDirection();
    jsData->Set(Nan::New<v8::String>("direction").ToLocalChecked(), Nan::New<v8::Number>(direction));

    args.GetReturnValue().Set(jsData);
}

void MotionDriverBinder::getState(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();
    MotionDriver::State state = motionDriver->getState();

    args.GetReturnValue().Set(state);
}

void MotionDriverBinder::rotateTo(const Nan::FunctionCallbackInfo<Value> &args) {
	Nan::HandleScope scope;

	if (args.Length() != 1 ||
		args[0]->IsInt32() == false) {
		
			args.GetIsolate()->ThrowException(Exception::TypeError(
		    Nan::New("Please check arguments. Expected arguments: (uint32 speed)").ToLocalChecked()
		));
	}

	MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();
	motionDriver->rotateTo(args[0]->Int32Value());
}

void MotionDriverBinder::moveArc(const Nan::FunctionCallbackInfo<Value> &args) {
	Nan::HandleScope scope;

	if (args.Length() != 4 ||
		args[0]->IsInt32() == false ||
		args[1]->IsInt32() == false ||
		args[2]->IsInt32() == false ||
		args[3]->IsInt32() == false) {

		args.GetIsolate()->ThrowException(Exception::TypeError(
		    Nan::New("Please check arguments").ToLocalChecked()
		));
    	}

    	MotionDriver *motionDriver = ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())->getMotionDriver();

    	Point2D center(args[0]->Int32Value(), args[1]->Int32Value());
	int angle = args[2]->Int32Value();
    	MotionDriver::MovingDirection direction = (args[3]->Int32Value() == 1) ? MotionDriver::FORWARD : MotionDriver::BACKWARD;

    	motionDriver->moveArc(center, angle, direction);
}

void MotionDriverBinder::refreshData(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    Callback *callback = new Callback(args[0].As<v8::Function>());
    AsyncQueueWorker(new AsyncRefreshDataWorker(callback, ObjectWrap::Unwrap<MotionDriverBinder>(args.Holder())));
}
