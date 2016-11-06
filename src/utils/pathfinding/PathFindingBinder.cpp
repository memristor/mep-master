#include "PathFindingBinder.h"

PathFindingBinder::PathFindingBinder(int maxX, int minX, int maxY, int minY) {
    pathFinding = new PathFinding(maxX, minX, maxY, minY);
}

void PathFindingBinder::Init(Local<Object> exports) {
    Nan::HandleScope scope;

    Local<FunctionTemplate> tmpl = Nan::New<FunctionTemplate>(New);
    tmpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tmpl, "search", search);
    Nan::SetPrototypeMethod(tmpl, "addObstacle", addObstacle);
    Nan::SetPrototypeMethod(tmpl, "removeObstacle", removeObstacle);

    exports->Set(Nan::New("PathFindingBinder").ToLocalChecked(), tmpl->GetFunction());
}

void PathFindingBinder::search(const Nan::FunctionCallbackInfo<Value> &args) {

}

void PathFindingBinder::addObstacle(const Nan::FunctionCallbackInfo<Value> &args) {

}

void PathFindingBinder::removeObstacle(const Nan::FunctionCallbackInfo<Value> &args) {

}

void PathFindingBinder::New(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    // Get params
    if (args.Length() != 4 ||
        args[0]->IsInt32() == false ||
        args[1]->IsInt32() == false ||
        args[2]->IsInt32() == false ||
        args[3]->IsInt32() == false) {

        args.GetIsolate()->ThrowException(Exception::TypeError(
            Nan::New("Invalid arguments. Required arguments: (int maxX, int minX, int maxY, int minY)").ToLocalChecked()
        ));
    }

    // Create object
    PathFindingBinder *pathFindingBinder =
        new PathFindingBinder(
            args[0]->Int32Value(),
            args[1]->Int32Value(),
            args[2]->Int32Value(),
            args[3]->Int32Value()
        );
    pathFindingBinder->Wrap(args.This());

    args.GetReturnValue().Set(args.This());
}
