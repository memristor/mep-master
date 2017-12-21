# Quick Intro

## What is MEP?
MEP is a modular and extendable development platform for programming autonomous robots (Eurobot). It provides an abstraction on
top of many hardware components (drivers) to be used in a simple API for defining robot's behaviour (strategy).
Also, it has built-in sensor fusion for obstacle detection and precise localisation, obstacle bypassing, task scheduling,
communication (services), simulation support, as well as basic features like logging and configuration.

Memristor team is working hard in order to implement computer vision and enhance current algorithms. Programming style
and patterns are the result of many years of experience competing on Eurobot competition.

MEP master is the central component in MEP and it has a role of the brain in the system. It designed to run on Linux based
embedded development boards (like Raspberry Pi).

![MEP Simple](./assets/mep-simple.png)  
_Big picture simple_
  
![MEP Full](./assets/mep-full.png)  
_Big picture full_

## Getting Started
For easy understanding, in further text, Raspberry Pi will be used as a development board.

### Linux installation
Please follow official Raspbian installation instructions
https://www.raspberrypi.org/documentation/installation/installing-images/README.md

Please use one of those Linux images:
- official Linux distribution for Raspberry Pi (https://www.raspberrypi.org/downloads/raspbian/) or
- Memristor's Raspbian edition (https://drive.google.com/drive/folders/0B8iyR5YUITZYYVFyWHNlaDNXMVk)

### SSH
To connect to Raspberry Pi from your computer and type commands remotely SSH is required. To configure SSH please
follow next tutorial:
https://www.raspberrypi.org/documentation/remote-access/ssh/

### Installation
Please make sure your SSH connection is ready because all following commands will be used in SSH! To install MEP master
please use the following command:
```git clone https://github.com/Memristor-Robotics/mep-master.git --depth 1 && cd mep-master && ./install```
The command will download MEP master source files and install all dependencies.

### Hello World
Before your robot make the first step please check if everything is connected properly (eg. batteries and electronic boards),
put your robot in the middle of a terrain and run:
```./mep -c ../strategies/boilerplate/DefaultScheduler.js```
This command will execute a strategy located in `strategies/boilerplate` and your robot should go 10cm forward and backwards.
If the robot went forward and backwards then congratulations! That means software, electronics and basic mechanisms works fine.
Now, the rest should be easy.

Please check ```./mep -h``` for more parameters.

## Strategy
Strategy defines robot's behaviour, what robot should do and how to react on opponent strategy
or hardware failure. Each **strategy** consist of many tasks and each **task** consists of 
multiple **commands**. A brain of each strategy is **scheduler** which should have advanced
logic (eg. AI) and it orders task priority by environment.  

Strategies are designed to be easily editable by students who don't have background in programming!

### Setting up new strategy
In `strategy` directory is located [boilerplate strategy](../strategies/boilerplate). 
Boilerplate strategy is very simple and well documented strategy intended to be base code for your 
new strategy.  

Please follow [this tutorial](../strategies/boilerplate/README.md) to set up new strategy.

### List of commands
In file `src/strategy/Shortcut.js` is list of shortcuts you can easily use in your strategy. Also, you
can extend list of shortcuts by putting in common file like it is done in [boilerplate example](../strategies/boilerplate/Common.js). 

- `go(x, y[, params])` Go to location (x, y) using additional params. Eg. `go(10, 20)` or `go(10, 20, { backward: true })`
- `rotate(angle[, params])` Rotate robot for given angle.
- `straight(distance)` Move robot straight for given distance in mm.
- `home()` Return robot to it's home position.
- `await delay(mills)` Do nothing for *mills* milliseconds.

## Configuration
TODO

## Drivers
Provides an abstraction on top of many hardware components.

### Hello World Driver
`HelloWorldDriver` meets minimal requirements to become a driver. All drivers are located drivers
```
class HelloWorldDriver {
  constructor(name, config) {
    Mep.Log.debug('Hello World');
  }

  provides() { return []; }
}
```
Each driver gets variables `name` and `config` in constructor. `name` is unique
name of each driver instance, and `config` is configuration object for
instance of the driver.

Method `provides()` can return empty array or array of strings which
represents data that can be provided by a driver. If driver provides
some type of data it must meets a requirements for that type of data. More
will be explained.

All drivers are located in directory `/drivers` and by convention have
dedicated directory, eg. SkeletonDriver is stored in
`/drivers/skeleton/HelloWorldDriver.js`.

Every driver must be added in configuration file. By adding our driver
in configuration file DriverManager knows that our driver should be instantiated.
```
...
Drivers:
  ...
  HelloWorldDriver:
    '@class': 'drivers/skeleton/HelloWorldDriver',
    '@init': true
```
An example of a driver in configuration file.


### PinDriver
Let's explain how PinDriver works (`drivers/pin/PinDriver.js`) as it is a good example.


