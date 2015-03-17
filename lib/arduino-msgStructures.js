/*************
 *
 * Structure of exchange data common for Messages and Commands. 'body' will be any one of the
 * messages or commands shown below
 *
 **************/
var frameStructure = [
    {'header'   : 'unsigned int'},
    {'length'   : 'unsigned int'},
    {'type'     : 'msg_t'},
    {'timeStamp': 'unsigned long'},
    {'body'     : 'MessageStructure'},
    {'footer'   : 'unsigned int'}
];

/*************
 *
 * Structure of messages sent from PID
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
    {'enable': 'bool'},
    {'outputUpdated': 'bool'}
];

var errorMsg= [
    {'errorCode': 'err_t'}
];

var testMsg= [
    {'state': 'sync_state_t'},
    {'code': 'unsigned int'},
    {'value': 'unsigned int'}
];

var ackMsg= [
    {'status': 'bool'},
    {'cmdType': 'cmd_t'}
];


/*************
 *
 * Structure of commands sent to PID
 *
 **************/

// 10
var enableSamplerCmd = [];

// 11
var disableSamplerCmd = [];

// 12
var configurePwmCmd = [
    {'dacChannel':'int'},       // use -1 for SW PDM
    {'pinNumber':'char'},       // for SW PDM only
    {'period':'unsigned int'},  // for SW PDM only
    {'resolution': 'char'}      // number of bits
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
    {'loopPolarity':'byte'}
];

// 14
var setOutputLimitsCmd = [
    {'maxOutput': 'float'},
    {'minOutput': 'float'}
];

// 15
var setPwmCmd = [
    {'value':'float'},
    {'loopEnable':'bool'}
];

// 16
var setSetpointCmd = [
    {'value':'float'},
    {'loopEnable':'bool'}
];

// 17
var enableLoopCmd = [];

// 18
var disableLoopCmd = [];

// 19
var enableStatusMessagesCmd = [];

// 20
var disableStatusMessagesCmd = [];

// Define the message and command message types
var messages= [
    statusMsg,             // MsgType 0
    errorMsg,              // MsgType 1
    testMsg,               // MsgType 2
    ackMsg                 // MsgType 3
];

var commands = [            // cmdType
    enableSamplerCmd,       // 10
    disableSamplerCmd,      // 11
    configurePwmCmd,        // 12
    setLoopConstantsCmd,    // 13
    setOutputLimitsCmd,     // 14
    setPwmCmd,
    setSetpointCmd,
    enableLoopCmd,
    disableLoopCmd,
    enableStatusMessagesCmd,
    disableStatusMessagesCmd
];

module.exports = {
    messages: messages,
    commands: commands
};