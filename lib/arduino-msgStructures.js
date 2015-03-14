/***

 Message sent up from PID Controller

 Protocol:        - numBytes:
 Header Sync    - 2
 MessageLength  - 2
 MessageType    - 1
 MessageBody    - N (max 62)
 Trailer Sync   - 2

 0. Status Report
 Type: 0
 Body: unsigned long timestamp (result of millis() )
 structure PidState structure (62 Bytes)


 1. Error Report
 Type: 1
 Body: byte ErrorCode
 structure PidState structure

 2. Echo Message
 Type: 2
 Body: Entire command sent down, including length, type and body


 Commands to send to PID Controller:

 Protocol:        - numBytes:
 Header Sync    - 2
 MessageLength  - 2
 MessageType    - 1
 MessageBody    - N (max 29)
 Trailer Sync   - 2


 10. Configure
 Type: 10
 Body:  byte adcChannel        (ADC Channel to sample)
 integer sampleRateHz   (ADC Sample rate to read samples at)
 byte updateRatio       (PID loop run once every updateRatio samples from ADC)
 byte doEcho            (0/1 don't/do echo back serial commands
 byte diagLedPin        (digital pin to use for diagnostic LED)

 11. Configure Limits
 Type: 10
 Body: float MaxOutput
 float MinOutput

 12. Start/Stop loop
 Type: 11
 Body: byte 0/1 to disable/enable loop

 13. Set Output PWM to a value
 Type: 12
 Body: float PWM value
 byte 0/1 to disable/enable loop

 14. Set loop constants
 Type: 13
 Body: float Kp
 float Ki
 float Kd
 float KpAggressive
 float KiAggressive
 float kdAggressive
 int  polarity (1/-1 for positive/negative)
 float aggressiveModeCutoff

 15. Configure Software PWM / Hardware PWM
 Type: 14
 Body: DAC Channel (-1: use PWM)
 byte         PinNumber   (Digital Pin number to use for PWM)
 unsigned int Period      (PWM Period in ms)
 unsigned int Resolution  (PWM number of bits)
 ***/

var dataMsgStructure = [
    {'timeStamp': 'unsigned long'},
    {'adcInput': 'float'},
    {'pidOutput': 'float'},
    {'setPoint': 'float'},
    {'dispKp': 'float'},
    {'dispKi': 'float'},
    {'dispKd': 'float'},
    {'kp': 'float'},
    {'ki': 'float'},
    {'kd': 'float'},
    {'ITerm': 'float'},
    {'DTerm': 'float'},
    {'lastInput': 'float'},
    {'outMin': 'float'},
    {'outMax': 'float'},
    {'controllerDirection': 'char'},
    {'enable': 'char'}
];

var testMsgStructure = [
    {'timeStamp': 'unsigned long'},
    {'data1': 'float'},
    {'data2': 'float'},
    {'count': 'unsigned int'},
    {'enable': 'bool'}
];


var messageStructures = [
    null,                       // type 0
    dataMsgStructure,           // type 1
    null,
    testMsgStructure            // type 3
];


var commandStructures = [];

module.exports = {
    messages: messageStructures,
    commands: commandStructures
};