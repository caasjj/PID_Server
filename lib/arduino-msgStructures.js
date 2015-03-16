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
    {'size': 'unsigned int'},
    {'count': 'unsigned int'}
];
//{'enable': 'bool'}

/*************
 *
 * Structure of commands sent to PID
 *
 **************/
var configCmd = [
    {'adcChannel':'char'},
    {'sampleRateHz':'int'},
    {'loopUpdateRatio':'char'},
    {'diagLedPin':'char'}
];

var configLimitsCmd = [
    {'maxOutput': 'float'},
    {'minOutput': 'float'}
];

var setSetPointCmd = [
    {'value':'float'},
    {'loopEnable':'bool'}
];

var setPvOutputCmd = [
    {'value':'float'},
    {'loopEnable':'bool'}
];

var setLoopConstantsCmd = [
    {'kp': 'float'},
    {'ki': 'float'},
    {'kd': 'float'},
    {'kpAggressive': 'float'},
    {'kiAggressive': 'float'},
    {'kdAggressive': 'float'},
    {'aggressiveCutoffPoint': 'float'},
    {'loopPolarity':'int'}
];

var configurePdmCmd = [
    {'dacChannel':'int'},       // use -1 for SW PDM
    {'pinNumber':'char'},       // for SW PDM only
    {'period':'unsigned int'},  // for SW PDM only
    {'resolution': 'char'}      // number of bits
];

var enableLoopCmd = [
    {'enabled':'bool'}
];

// Define the message and command message types
var messages= [
    statusMsg,              // MsgType 0
    errorMsg,               // MsgType 1
    testMsg                // MsgType 2
];


var commands = [            // cmdType
    configCmd,              // 10 (commandBaseOffset + 0)
    configLimitsCmd,        // 11
    setSetPointCmd,         // 12
    setPvOutputCmd,         // 13
    setLoopConstantsCmd,    // 14
    configurePdmCmd,        // 15
    enableLoopCmd           // 16
];



module.exports = {
    messages: messages,
    commands: commands
};