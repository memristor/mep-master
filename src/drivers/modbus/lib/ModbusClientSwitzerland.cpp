#include "ModbusClientSwitzerland.h"

#define TAG "ModbusClientSwitzerland "

ModbusClientSW* ModbusClientSW::modbusClientSWInstance = 0;

ModbusClientSW::ModbusClientSW(): m_mutex(new mutex()){
    modbus = ModbusMaster::getModbusInstance();
    config.minimalDelay = 2;
    config.tryCounter = 10;
    config.delayCounterReadSlow = 20;
    config.delayCounterReadFast = 10;
    config.delayCounterReadNormal = 15;
    config.delayCounterWrite = 2;
    config.retryDelay = 5;
    config.errorTimeout = 1000;
    currentInstruction.instruction = NONE;
    std::cout<<"Created ModbusClientSW" << endl;
}


ModbusClientSW* ModbusClientSW::getModbusClientInstance(){
    if(!modbusClientSWInstance){
        modbusClientSWInstance = new ModbusClientSW();

    }
    return modbusClientSWInstance;
}

void ModbusClientSW::main(const AsyncProgressWorker::ExecutionProgress& progress){
    //bool success;
    // TODO
    //
    unique_lock<mutex> lock(InstructionQueueMutex);
    while(!shouldStop){
        switch (currentState){
        case CHECK:{
            while(setQueue.empty() && readingMap.empty()){
                std::cout << "Modbus: Waiting for a check" << std::endl;
                setQueueNotEmpty.wait(lock);

                // START: Callback test section
                /*
                ModbusCallbackData modbusCallbackData;
                modbusCallbackData.slaveAddress = 1;
                modbusCallbackData.functionAddress = 5;
                modbusCallbackData.detected = true;


                progress.Send(reinterpret_cast<const char*>(&modbusCallbackData), sizeof(modbusCallbackData));
                this_thread::sleep_for(chrono::milliseconds(1000 * 1));

                progress.Send(reinterpret_cast<const char*>(&modbusCallbackData), sizeof(modbusCallbackData));
                this_thread::sleep_for(chrono::milliseconds(1000 * 10));
                */
                // END: Callback test section


                break;
            }

            if(errorElectronic == ERROR){
                this_thread::sleep_for(chrono::microseconds(config.errorTimeout));

            }
            if(!setQueue.empty()){
                currentState = DELAY;
                nextState = WRITE;
                break;
            }
            if(!readingMap.empty()){
                currentState = DELAY;
                nextState= READ;
                break;
            }
            break;
        }
        case DELAY:{
            this_thread::sleep_for(chrono::milliseconds(config.minimalDelay));
            currentState = nextState;
            break;
        }
        case WRITE: {
            currentState = CHECK;
            if(counterWrite < config.delayCounterWrite) {counterWrite++; break;}

            if (currentInstruction.instruction == NONE){
                currentInstruction = getNextInstruction();
            }
            counterWrite = 0;
            bool success;
            if(currentInstruction.instruction == WRITE_REGISTER){
                success = writeRegister(currentInstruction.data);
                if (success){
                    currentInstruction.instruction = NONE;
                }
                break;
            }else if(currentInstruction.instruction == WRITE_COIL){
                success = writeCoil(currentInstruction.data);
                if(success){
                    currentInstruction.instruction = NONE;
                }
                break;
            }
            break;
        }
        case READ:{
            currentState = CHECK;
            switch(readSpeed){
            case FAST: if ( counterRead < config.delayCounterReadFast) counterRead++; break;
            case NORMAL: if ( counterRead < config.delayCounterReadNormal) counterRead++; break;
            case SLOW: if (counterRead < config.delayCounterReadSlow) counterRead++; break;
            }
            if(counterMap >= mapID){
                counterMap = 0;
            }else{
                counterMap++;
            }
            m_mutex->lock();
            callbackData allData = readingMap[counterMap];
            m_mutex->unlock();

            // now read data

            if(allData.reading){
                bool successReading;
                if(allData.region == COIL){
                    successReading = readCoil(allData.modID.slave_address,allData.modID.function_address,&allData.detected);

                    if (successReading && allData.detected){
                        m_mutex->lock();
                        readingMap[counterMap].reading = false;
                        m_mutex->unlock();

                        // Notify
                        ModbusCallbackData modbusCallbackData;
                        modbusCallbackData.slaveAddress = allData.modID.slave_address;
                        modbusCallbackData.functionAddress = allData.modID.function_address;
                        modbusCallbackData.detected = true;
                        progress.Send(reinterpret_cast<const char*>(&modbusCallbackData), sizeof(modbusCallbackData));
			LOG(INFO) << TAG << "Coil state (" << modbusCallbackData.slaveAddress << ", " << modbusCallbackData.functionAddress << ") changed";

                        counterRead = 0;
                    }else if(successReading && allData.callbackOnNotDetected){
                        m_mutex->lock();
                        readingMap[counterMap].reading = false;
                        m_mutex->unlock();

                        // Notify
                        ModbusCallbackData modbusCallbackData;
                        modbusCallbackData.slaveAddress = allData.modID.slave_address;
                        modbusCallbackData.functionAddress = allData.modID.function_address;
                        modbusCallbackData.detected = false;
                        progress.Send(reinterpret_cast<const char*>(&modbusCallbackData), sizeof(modbusCallbackData));

                        counterRead = 0;
                        if(allData.modID.function_address == char(7)){
//                            std::cout << "reading coil, value: " << allData.detected << std::endl;
                        }
                    }else{
                        counterRead = 0;
                    }

                }else if( allData.region == REGISTER){
                    successReading = readRegister(allData.modID.slave_address,allData.modID.function_address, &allData.registerData);
                    if(successReading){
                        m_mutex->lock();
                        readingMap[counterMap].reading = false;
                        m_mutex->unlock();
                        allData.interface->callbackRegisterFunction(counterMap, allData.registerData);
                        counterRead = 0;
                    }else{
                        counterRead = 0;
                    }
                }
            } // end if reading = true;
            break;
        }
        }
    }

}

ModbusClientSW::Instruction ModbusClientSW::getNextInstruction(){
    Instruction inst;
    if(!setQueue.empty()){
        m_mutex->lock();
        inst = setQueue.front();
        setQueue.pop();
        m_mutex->unlock();
    }else{
        std::cout << "returningNone" << std::endl;
        inst.instruction = NONE;
    }
    return inst;

}

void ModbusClientSW::stop(){
    m_mutex->lock();
    setQueue.push(Instruction(STOP));
    shouldStop = true;
    m_mutex->unlock();
    setQueueNotEmpty.notify_all();
}


bool ModbusClientSW::setRegister(unsigned char _slave_address, short _function_address, short _data, bool _blocking){
    writeData data;
    data.id.slave_address = _slave_address;
    data.id.function_address = _function_address;
    data.data = _data;
    if(!_blocking){
        m_mutex->lock();
        setQueue.push(Instruction(WRITE_REGISTER,data));
        m_mutex->unlock();
        setQueueNotEmpty.notify_one();
        return true;
    }else{
        return writeRegister(data);
    }
}

bool ModbusClientSW::setCoil(unsigned char _slave_address, short _function_address, short _data, bool _blocking){
    writeData data;
    data.id.slave_address = _slave_address;
    data.id.function_address = _function_address;
    data.data = _data;
    if(!_blocking){
        m_mutex->lock();
        setQueue.push(Instruction(WRITE_COIL,data));
        m_mutex->unlock();
        return true;
    }else{
        return writeRegister(data);
    }
}

bool ModbusClientSW::writeRegister(writeData _data){
    int counter = 0 ;
    bool success = false;
    std::cout << "writeing to register: "
              << int(_data.id.slave_address) << ":"
              << _data.id.function_address << ":"
              << _data.data << std::endl;

    lock_guard<mutex> lock(*m_mutex);

    success = modbus->ModbusPresetSingleRegister(_data.id.slave_address,_data.id.function_address, _data.data);

    while(!success && counter<config.tryCounter && errorElectronic == NO_ERROR){
        this_thread::sleep_for(chrono::milliseconds(config.retryDelay));
        success = modbus->ModbusPresetSingleRegister(_data.id.slave_address,_data.id.function_address, _data.data);
        counter++;
    }

    if (!success){
        std::cout << "ERROR IN ELECTRONIC" << std::endl;
        errorElectronic = ERROR;
    }

    return success;
}

bool ModbusClientSW::writeCoil(writeData _data){

    int counter = 0 ;
    bool success = false;
    std::cout << "writeing to register: "
              << int(_data.id.slave_address) << ":"
              << _data.id.function_address << ":"
              << _data.data << std::endl;

    lock_guard<mutex> lock(*m_mutex);

    success = modbus->ModbusForceSingleCoil(_data.id.slave_address,_data.id.function_address, _data.data);

    while(!success && counter<config.tryCounter && errorElectronic == NO_ERROR){
        this_thread::sleep_for(chrono::milliseconds(config.retryDelay));
        success = modbus->ModbusPresetSingleRegister(_data.id.slave_address,_data.id.function_address, _data.data);
        counter++;
    }

    if (!success){
        std::cout << "ERROR IN ELECTRONIC" << std::endl;
        errorElectronic = ERROR;
    }

    return success;
}

bool ModbusClientSW::readCoil(unsigned char _slave_address, short _function_address, bool* _callFunction){
    signed char data;
    bool success = false;
    int counter = 0;
    lock_guard<mutex> lock(*m_mutex);

    success = modbus->ModbusReadCoilStatus(_slave_address,_function_address,1, &data);

    while(!success && counter<config.tryCounter && errorElectronic == NO_ERROR) {
        this_thread::sleep_for(chrono::milliseconds(config.retryDelay));
        success = modbus->ModbusReadCoilStatus(_slave_address,_function_address,1, &data);
        counter++;
    }

    if (!success){
        std::cout << "ERROR IN ELECTRONIC" << std::endl;
        errorElectronic = ERROR;
        *_callFunction = false;
        return false;
    }

    /*
    std::cout << "reading from register: "
              << int(_id.slaveAddress) << " : "
              << _id.functionAddress << " = "
              << int(data) << " : "
              << data
              << std::endl;
*/

    if(data == char(1)){
        *_callFunction = true;
        //std::cout << "OBJECT" << std::endl;
    }else if (data == '1'){
        *_callFunction = true;
        //std::cout << "OBJECT" << std::endl;
    }else if(data == char(0)){
        *_callFunction = false;
    }else if(data == '0'){
        *_callFunction = false;
    }else{
        std::cout << "ERRORO IN CHECKING STATE" << std::endl;
        *_callFunction = false;
    }

    return true;
}

bool ModbusClientSW::readRegister(unsigned char _slaveAddress, short _functionAddress, short* _data){
    short data;
    bool success;
    int counter = 0;

    lock_guard<mutex> lock(*m_mutex);

    success = modbus->ModbusReadHoldingRegisters(_slaveAddress,_functionAddress,1,&data);

    while(!success && counter<config.tryCounter && errorElectronic == NO_ERROR ) {
        this_thread::sleep_for(chrono::milliseconds(config.retryDelay));
        success = modbus->ModbusReadHoldingRegisters(_slaveAddress,_functionAddress,1,&data);
        counter++;
    }

    if (!success){
        std::cout << "ERROR IN ELECTRONIC" << std::endl;
        errorElectronic = ERROR;
        return false;
    }

    *_data = data;
    return success;
}

int ModbusClientSW::registerCoilReading(unsigned char _slave_address, short _function_address , bool _callbackOnNotDetected){

    callbackData data;

    data.reading = false;
    data.detected = false;
    data.modID.function_address = _function_address;
    data.modID.slave_address = _slave_address;
    data.region = COIL;
    data.callbackOnNotDetected = _callbackOnNotDetected;

    m_mutex->lock();

    readingMap[mapID] = data;
    mapID++;
    counterMap = 0;
    m_mutex->unlock();
    setQueueNotEmpty.notify_one();
    int id = mapID - 1;
    return id ;
}

int ModbusClientSW::registerRegisterReading(unsigned char _slave_address, short _function_address){
    callbackData data;

    data.modID.slave_address = _slave_address;
    data.modID.function_address = _function_address;
    data.detected = false;
    data.reading = false;
    data.region = REGISTER;

    m_mutex->lock();
    readingMap[mapID] = data;
    mapID++;
    counterMap=0;
    m_mutex->unlock();
    int id = mapID - 1;
    return id;
}

void ModbusClientSW::setReading(int _id, bool _readingTrue){
    if(_id < mapID){
        if(_readingTrue){
            m_mutex->lock();
            readingMap[_id].reading = true;
            //std::cout << "reading true" << std::endl;
            m_mutex->unlock();
        }else{
            m_mutex->lock();
            readingMap[_id].reading = false;
            //std::cout << "reading false" << std::endl;
            m_mutex->unlock();
        }
    }
}
