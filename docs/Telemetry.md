# Telemetry

As a space shuttle all is automatic during launch, Robot should have a mean to get all telemetry out of the box and send
them to space nearby for team to analyze, understand and act to adapt or correct parameters for the next launch.

A Telemetry system is composed by :

- a set of robot modules with real time KPI (Key Point Indicators)
- a mean to transmit efficiently information to base
- a base telemetry reception to record all information
- a set of dashboards to view and analyze data


## KPI Probes

Each Robot modules has his own set of KPI based on module functionality.

For example, a battery device has following KPI :
- Charge
- Temperature
- Battery high and low voltage threshold
- Real time Amperage consumption


Each of this measures can be collected via Probes and transmitted to base. 


## Efficient Transmission System

Transmission between Probe and outer world should have a limited effect on Robot System and capabilities.
Like a droid in the dark, standing alone, it must transmit data at a fix rate but does not requires any external action
to work. Like UDP transmission : sending bottles in the sea without acknowledging any response.

Transmission should also be efficient in sent information, this means data format has to be tuned to avoid unnecessary 
data structure decorator to minimize telemetry packet size.

Needs between telemetry information, packet optimization, data transmission should be optimal vs System computation and
resources consumption.

## Base Data Recorder

Data Recorder receive data from anywhere and log them into data storage. 
Data recorder must be :

- Simple and reliable
- Able to receive Telemetry from multiple robots at the same time (origin must be logged)
- Store received information even if data are corrupted or partial
- Provide a way to extract recorded information either in real time or request based 


## Telemetry Dashboards

Recording data is a key function, but without any dashboard to let Human understand what's going on it's useless.
Dashboard should be able to :

- Provide raw data access
- Provide visual information easy to understand


## Implementation

### KPI Probes

Probes should transmit a metric packet with :

- Origin
- Metric date
- A set of
 - Metric type
 - Metric value





