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
    {'adcInput': 'int16_t'},
    {'pidOutput': 'int16_t'},
    {'setPoint': 'int16_t'},
    {'dispKp': 'int16_t'},
    {'dispKi': 'int16_t'},
    {'dispKd': 'int16_t'},
    {'kp': 'int16_t'},
    {'ki': 'int16_t'},
    {'kd': 'int16_t'},
    {'ITerm': 'int16_t'},
    {'DTerm': 'int16_t'},
    {'lastInput': 'int16_t'},
    {'outMin': 'int16_t'},
    {'outMax': 'int16_t'},
    {'controllerDirection': 'int8_t'},
    {'enabled': 'bool'},
    {'outputUpdated': 'bool'},
    {'aggressiveMode': 'bool'}
];

var errorMsg= [
    {'errorCode': 'err_t'}
];

var testMsg= [
    {'state': 'sync_state_t'},
    {'valueUInt8': 'uint8_t'},
    {'valueUInt16': 'uint16_t'},
    {'valueUint32': 'uint32_t'},
    {'valueFloat': 'int16_t'},
    {'valueBool': 'bool'}
];

var ackMsg= [
    {'status': 'int8_t'},
    {'cmdType': 'cmd_t'}
];

var loopKMsg= [
    {'kp': 'int16_t'},
    {'ki': 'int16_t'},
    {'kd': 'int16_t'},
    {'kpAggressive': 'int16_t'},
    {'kiAggressive': 'int16_t'},
    {'kdAggressive': 'int16_t'},
    {'aggressiveCutoffPoint':'int16_t'},
    {'loopUpdateRatio':'uint8_t'},
    {'loopPolarity':'int8_t'}
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
    {'pulseWidth':'uint8_t'},  // for SW PDM only
    {'numBits':'uint8_t'},     // for SW PDM only
    {'pwmValue': 'uint16_t'}   // set value when changing
];

// 13
var setLoopConstantsCmd = [
    {'kp': 'int16_t'},
    {'ki': 'int16_t'},
    {'kd': 'int16_t'},
    {'kpAggressive': 'int16_t'},
    {'kiAggressive': 'int16_t'},
    {'kdAggressive': 'int16_t'},
    {'aggressiveCutoffPoint': 'int16_t'},
    {'loopUpdateRatio': 'byte'},
    {'loopPolarity':'byte'}
];

// 14
var getLoopConstantsCmd = [];

// 15
var setOutputLimitsCmd = [
    {'maxOutput': 'int16_t'},
    {'minOutput': 'int16_t'}
];

//
var enablePwmCmd = [];

var disablePwmCmd = [];

// 16
var setPwmCmd = [
    {'value':'int16_t'},
    {'loopEnable':'bool'}
];

// 17
var setSetpointCmd = [
    {'setpoint':'int16_t'},
    {'loopEnabled':'bool'}
];

// 18
var enableLoopCmd = [];

// 19
var disableLoopCmd = [];

// 20
var enableStatusMessagesCmd = [];

// 21
var disableStatusMessagesCmd = [];

// Define the message and command message types
var messages= [
    statusMsg,             // MsgType 0
    errorMsg,              // MsgType 1
    testMsg,               // MsgType 2
    ackMsg,                // MsgType 3
    loopKMsg               // MsgType 4
];

var commands = [            // cmdType
    enableSamplerCmd,       // 10
    disableSamplerCmd,      // 11
    configurePwmCmd,        // 12
    setLoopConstantsCmd,    // 13
    getLoopConstantsCmd,    // 14
    setOutputLimitsCmd,     // 15
    enablePwmCmd,           // 16
    disablePwmCmd,          // 17
    setPwmCmd,              // 18
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