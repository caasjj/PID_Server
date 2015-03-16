/*************
 *
 * Structure of exchange data common for Messages and Commands. 'body' will be any one of the
 * messages or commands shown below
 *
 **************/
var frameStructure = [
    {'header': 'unsigned int'},
    {'length': 'unsigned int'},
    {'type':'byte'},
    {'timeStamp':'unsigned long'},
    {'body': 'MessageStructure'},
    {'footer': 'unsigned int'}
];

/*************
 *
 * Structure of messgaes sent from PID
 *
**************/
var statusMsg= [
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
    {'controllerDirection': 'bool'},
    {'enable': 'bool'}
];

var errorMsg= [
    {'errorCode': 'byte'}
];

//{'data1': 'float'},
var testMsg= [
    {'code': 'unsigned int'},
    {'value': 'unsigned int'}
];
//{'enable': 'bool'}

/*************
 *
 * Structure of commands sent to PID
 *
 **************/
// 10
var configLimitsCmd = [
    {'maxOutput': 'float'},
    {'minOutput': 'float'}
];

// 11
var setSetpointCmd = [
    {'value':'float'},
    {'loopEnable':'bool'}
];

// 12
var setPwmCmd = [
    {'value':'float'},
    {'loopEnable':'bool'}
];

// 13
var setLoopConstantsCmd = [
    {'kp': 'float'},
    {'ki': 'float'},
    {'kd': 'float'},
    {'kpAggressive': 'float'},
    {'kiAggressive': 'float'},
    {'kdAggressive': 'float'},
    {'aggressiveCutoffPoint': 'float'},
    {'loopUpdateRatio': 'byte'},
    {'loopPolarity':'int'}
];

// 14
var configPwmCmd = [
    {'dacChannel':'int'},       // use -1 for SW PDM
    {'pinNumber':'char'},       // for SW PDM only
    {'period':'unsigned int'},  // for SW PDM only
    {'resolution': 'char'}      // number of bits
];

// 15
var enableLoopCmd = [
    {'enabled':'byte'}
];

// 16
var enableStatusMsgCmd = [
    {'enabled':'byte'}
];

// Define the message and command message types
var messages= [
    statusMsg,             // MsgType 0
    errorMsg,              // MsgType 1
    testMsg                // MsgType 2
];


var commands = [            // cmdType
    configLimitsCmd,        // 10
    setSetpointCmd,         // 11
    setPwmCmd,              // 12
    setLoopConstantsCmd,    // 13
    configPwmCmd,           // 14
    enableLoopCmd,          // 15
    enableStatusMsgCmd      // 16
];



module.exports = {
    messages: messages,
    commands: commands
};