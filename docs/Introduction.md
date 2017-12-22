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

| Big picture simple                     | Big picture full                   |
|:--------------------------------------:|:----------------------------------:|
| ![MEP Simple](./assets/mep-simple.png) | ![MEP Full](./assets/mep-full.png) |

## Getting Started
For easy understanding, in further text, Raspberry Pi will be used as a development board.

### Linux installation
Please follow official Raspbian installation instructions
https://www.raspberrypi.org/documentation/installation/installing-images/README.md

Please use one of those Linux images:
- official Linux distribution for Raspberry Pi (https://www.raspberrypi.org/downloads/raspbian/) or
- Memristor's Raspbian edition (https://drive.google.com/drive/folders/0B8iyR5YUITZYYVFyWHNlaDNXMVk)

### SSH connection
To connect to Raspberry Pi from your computer and type commands remotely SSH is required. To configure SSH please
follow next tutorial:
https://www.raspberrypi.org/documentation/remote-access/ssh/

### mep-master installation
Please make sure your SSH connection is ready because all following commands will be used in SSH! To install MEP master
please use the following command:
```curl https://raw.githubusercontent.com/Memristor-Robotics/mep-master/master/install | sh```
The command will download MEP master source files and install all dependencies.

### Hello World move
Before your robot make the first step please check if everything is connected properly (eg. batteries and electronic boards),
put your robot in the middle of a terrain and run:
```./mep -c ../strategies/boilerplate/DefaultScheduler.js```
This command will execute a strategy located in `strategies/boilerplate` and your robot should go 10cm forward and backwards.
If the robot went forward and backwards then congratulations! That means software, electronics and basic mechanisms works fine.
Now, the rest should be easy.

Please check ```./mep -h``` for more parameters.

## Strategy
The strategy defines robot's behaviour, what robot should do and how to react to opponent strategy
or hardware failure. Each **strategy** consist of many tasks and each **task** consists of multiple **commands**. A brain of each strategy is **scheduler** which should have advanced
logic (eg. AI) and it orders task priority by the environment.  

> Strategies are designed to be easily editable by students who don't have a background in programming!

### Setting up new strategy
In `strategy` directory is located [boilerplate strategy](../strategies/boilerplate). 
The boilerplate strategy is very simple and well-documented strategy intended to be base code for your new strategy.  

Please follow [this tutorial](../strategies/boilerplate/README.md) to set up new strategy.

### List of commands
In file `src/strategy/Shortcut.js` is a list of shortcuts you can easily use in your strategy. Also, you
can extend the list of shortcuts for each strategy by putting in a common file like it is done in [boilerplate example](../strategies/boilerplate/Common.js). 

Note that all commands are asynchronous and you need keyword `await` in front of command if you want to wait it is fully executed.

- `go(x, y[, params])` Go to location (x, y) using additional params.
  - alias [`services.motion.MotionService.go()`](../src/services/motion/MotionService.js)
  - example `await go(0, 0)` Go to the center of a terrain.
  - example `await go(0, 0, { backward: true })` Go to the center of a terrain, but go backwards.
- `rotate(angle[, params])` Rotate robot for given angle.
  - alias [`services.motion.MotionService.rotate()`](../src/services/motion/MotionService.js)
  - example `await rotate(50)` Rotate robot for 50 degrees in the current position.
- `straight(distance)` Move robot straight for given distance in mm.
  - alias [`services.motion.MotionService.straight()`](../src/services/motion/MotionService.js)
  - example `await straight(50)` Move robot 50mm forward.
- `home()` Return robot to it's home position.
- `delay(mills)` Do nothing for *mills* milliseconds.
  - alias [`src.misc.delay()`](../src/misc/Delay.js)

## Configuration
All configuration files are located in `config` directory. Configuration is used to:
- configure services (eg. static obstacles, default parameters for movement...),
- initialize and configure drivers (eg. communication protocols, analogue and digital pins, motion driver...) &
- general purpose parameters (eg. logging, table name, match duration...).

Default configuration is located in `config/default.yaml` and it is overriden by `config/[robot_name].yaml`. And if simulation is turned on than `config/default.yaml` and `config/[robot_name].yaml` are overriden by `config/[robot_name].simulation.yaml`. Therefore, config files are inherited as `config/default.yaml` > `config/[robot_name].yaml` > `config/[robot_name].simulation.yaml`.

> Just like strategies, the configuration is designed to be easily editable by students who don't have a background in programming!

### Initializing PinDriver
TODO

## Drivers
Provides an abstraction on top of many hardware components.

### Hello World Driver
`HelloWorldDriver` meets minimal requirements to become a driver. All drivers are located drivers
```javascript
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

Method `provides()` can return an empty array or array of strings which
represents data that can be provided by a driver. If the driver provides
some type of data it must meet requirements for that type of data. More
will be explained.

All drivers are located in directory `/drivers` and by convention have
dedicated directory, eg. SkeletonDriver is stored in
`/drivers/skeleton/HelloWorldDriver.js`.

Every driver must be added in a configuration file. By adding our driver
in configuration file, DriverManager knows that our driver should be instantiated.

```yaml
Drivers:
  ...
  HelloWorldDriver:
    '@class': 'drivers/skeleton/HelloWorldDriver',
    '@init': true
```
An example of a driver in configuration file.
