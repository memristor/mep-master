#include "PathFindingBinder.h"


class AsyncAddObstacleWorker : public Nan::AsyncWorker {
public:
    AsyncAddObstacleWorker(Nan::Callback* callback, PathFinding* pathFinding, std::vector<geometry::Point2D>* points) :
        Nan::AsyncWorker(callback),
        pathFinding(pathFinding),
        points(points) { }
    ~AsyncAddObstacleWorker() {
        delete points;
     }
    void Execute() {
        id = pathFinding->addObstacle(*points);
    }

    void HandleOKCallback() {
        v8::Local<v8::Value> argv[] = {
            Nan::New<v8::Number>(id)
        };
        callback->Call(1, argv);
    }
private:
    PathFinding* pathFinding;
    std::vector<geometry::Point2D>* points;
    int id;
};

PathFindingBinder::PathFindingBinder(int maxX, int minX, int maxY, int minY) {
    pathFinding = new PathFinding(maxX, minX, maxY, minY);
}

PathFinding* PathFindingBinder::getPathFinding() {
    return pathFinding;
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
    Nan::HandleScope scope;

    // Export `start` and `goal`
    Local<Object> jsStart = args[0]->ToObject();
    Local<Object> jsGoal = args[1]->ToObject();

    geometry::Point2D start(
        jsStart->Get(Nan::New<v8::String>("x").ToLocalChecked())->IntegerValue(),
        jsStart->Get(Nan::New<v8::String>("y").ToLocalChecked())->IntegerValue()
    );

    geometry::Point2D goal(
        jsGoal->Get(Nan::New<v8::String>("x").ToLocalChecked())->IntegerValue(),
        jsGoal->Get(Nan::New<v8::String>("y").ToLocalChecked())->IntegerValue()
    );


    // Execute path finding
    std::deque<geometry::Point2D> ret;
    PathFinding *pathFinding = ObjectWrap::Unwrap<PathFindingBinder>(args.Holder())->getPathFinding();
    pathFinding->search(start, goal, ret);



    // Export `ret`
    Local<v8::Array> jsRet = Nan::New<v8::Array>();
    int i = 0;
    for (geometry::Point2D point : ret) {
        Local<Object> jsRetPoint = Nan::New<Object>();
        jsRetPoint->Set(Nan::New<v8::String>("x").ToLocalChecked(), Nan::New<v8::Number>(point.getX()));
        jsRetPoint->Set(Nan::New<v8::String>("y").ToLocalChecked(), Nan::New<v8::Number>(point.getY()));

        jsRet->Set(i++, jsRetPoint);
    }

    args.GetReturnValue().Set(jsRet);
}

void PathFindingBinder::addObstacle(const Nan::FunctionCallbackInfo<Value> &args) {
    Nan::HandleScope scope;

    std::vector<geometry::Point2D>* points = new std::vector<geometry::Point2D>();

    // Export points
    Local<Object> jsPoints = args[0]->ToObject();
    int pointsNumber = jsPoints->Get(Nan::New<v8::String>("length").ToLocalChecked())->ToObject()->Uint32Value();
    points->resize(pointsNumber);

    for (int i = 0; i < pointsNumber; i++) {
        Local<Object> jsPoint = jsPoints->Get(i)->ToObject();
        (*points)[i] = geometry::Point2D(
            jsPoint->Get(Nan::New<v8::String>("x").ToLocalChecked())->IntegerValue(),
            jsPoint->Get(Nan::New<v8::String>("y").ToLocalChecked())->IntegerValue()
        );
    }

    // Add to path finding
    PathFinding *pathFinding = ObjectWrap::Unwrap<PathFindingBinder>(args.Holder())->getPathFinding();
    int id = pathFinding->addObstacle(*points);
    args.GetReturnValue().Set(id);

    //Callback *callback = new Callback(args[1].As<v8::Function>());
    //AsyncQueueWorker(new AsyncAddObstacleWorker(callback, pathFinding, points));
}

void PathFindingBinder::removeObstacle(const Nan::FunctionCallbackInfo<Value> &args) {
   Nan::HandleScope scope;

   int id = args[0]->IntegerValue();
   PathFinding *pathFinding = ObjectWrap::Unwrap<PathFindingBinder>(args.Holder())->getPathFinding();
   pathFinding->removeObstacle(id);
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
