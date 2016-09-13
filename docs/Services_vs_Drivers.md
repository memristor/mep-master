## Drivers 
A driver provides a software interface to hardware devices, enabling 
services and users to access hardware functions without needing 
to know precise details of the hardware being used.  

The configuration file determinate which driver is going to be used and
which parameters to use. It is very useful when we are speaking about 
rapid hardware changes and using the same core for multiple robots.

## Services
A service presents high level of abstraction and it refers to a set of 
software functionalities that can be for different purposes. The service 
implements complex algorithms to collect, synthesize and process data 
from drivers and it also provides interface to control the robot.

Services are hardware independent and all services are always available. 
Using driver _provide_ mechanism services are able to collect data from
unlimited number of drivers without needing to reprogram the service.
