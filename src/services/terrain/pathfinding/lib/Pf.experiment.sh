#!/bin/sh

OUTPUT=PathFindingExecutable.experiment

g++ $(find -name '*.cpp' ! -name '*Binder.cpp') -o ${OUTPUT} -std=c++11 && ./${OUTPUT} && rm ${OUTPUT}