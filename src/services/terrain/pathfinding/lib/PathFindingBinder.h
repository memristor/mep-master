#include <nan.h>
#include <vector>
#include <deque>
#include "PathFinding.h"
#include "Point2D.h"

using v8::Local;
using v8::FunctionTemplate;
using v8::Object;
using v8::Value;
using v8::Handle;
using v8::Isolate;
using v8::Exception;
using namespace std;
using Nan::Callback;
using Nan::New;

using path_finding::PathFinding;

class PathFindingBinder : public Nan::ObjectWrap {
public:
    static void Init(Local<Object> exports);
    PathFinding* getPathFinding();

private:
    static void New(const Nan::FunctionCallbackInfo<Value> &args);
    PathFindingBinder(int maxX, int minX, int maxY, int minY);

    static void search(const Nan::FunctionCallbackInfo<Value> &args);
    static void addObstacle(const Nan::FunctionCallbackInfo<Value> &args);
    static void removeObstacle(const Nan::FunctionCallbackInfo<Value> &args);

    PathFinding* pathFinding;
};

NODE_MODULE(PathFindingBinder, PathFindingBinder::Init)
