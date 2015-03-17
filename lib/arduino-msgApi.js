var through2 = require('through2');
var messageStructures = require('./arduino-msgStructures.js').messages;
var commandStructures = require('./arduino-msgStructures.js').commands;

var endian = 'LE';

var commandBaseOffset = 10; // see Messager.h CMD_BASE_OFFSET

var byteLengths = {
    'Int8'  : 1,
    'UInt8' : 1,
    'Int16' : 2,
    'UInt16': 2,
    'UInt32': 4,
    'Float' : 4
};

var nameToTypeMap = {
    'uint8_t'       : 'UInt8',
    'uint16_t'      : 'UInt8',
    'uint32_t'      : 'UInt32',
    'int8_t'        : 'Int8',
    'int16_t'       : 'Int16',
    'int32_t'       : 'Int32',
    'byte'          : 'Int8',
    'bool'          : 'UInt8',
    'unsigned char' : 'UInt8',
    'char'          : 'Int8',
    'int'           : 'Int16',
    'unsigned int'  : 'UInt16',
    'unsigned long' : 'UInt32',
    'float'         : 'Float',
    'err_t'         : 'UInt16',
    'cmd_t'         : 'UInt16',
    'msg_t'         : 'UInt16',
    'sync_state_t'  : 'UInt16'
};

function parseMessage(chunk) {

    var msgLength = chunk.readUInt16LE(0, true),
        msgType = chunk.readUInt16LE(2, true),
        timeStamp = chunk.readUInt32LE(4, true),
        index = 8,
        output = {
            msgType: msgType,
            timeStamp: timeStamp
        };

    msgStructure = messageStructures[msgType];

    if ( !msgStructure) {
        output.error = 'Unknown message structure';
        return JSON.stringify(output) + '\n';
    }

    msgStructure.forEach(function (msgField) {
        var fieldName = Object.keys(msgField)[0],
            fieldValue = msgField[fieldName],
            fieldType = nameToTypeMap[fieldValue],
            bufferMethod = 'read' + fieldType,
            length = byteLengths[fieldType];

        msgLength -= length;
        if (length > 1) bufferMethod += endian;
        if (index + length > chunk.length) return null;
        output[fieldName] = chunk[bufferMethod](index, true);
        index += length;
    });

    if (msgLength !== 8) {
        output.warn = 'Length mismatch in parser';
    }

    return JSON.stringify(output) + '\n';
}

function createCommandBuffer(cmdType, cmdData) {

    var cmdBuffer = Buffer(4),
        cmdBufferLength = 0,
        temp;

    cmdBuffer['writeUInt32'+endian](Date.now() - GLOBAL._appStartTime );

    // sanity check
    if ( (cmdType-commandBaseOffset) < 0 || (cmdType-commandBaseOffset) > commandStructures.length -1)
        return null;

    var cmdStructure = commandStructures[cmdType - commandBaseOffset];

    //console.log(GLOBAL._appStartTime);
    cmdStructure.forEach( function(cmdField) {

        var fieldName = Object.keys(cmdField)[0],
            fieldValue = cmdField[fieldName],
            fieldType = nameToTypeMap[fieldValue],
            bufferMethod = 'write' + fieldType,
            length = byteLengths[fieldType];

        cmdBufferLength += length;

        if (length > 1) bufferMethod += endian;
        temp = new Buffer(length);
        temp[bufferMethod](cmdData[fieldName]);
        cmdBuffer = Buffer.concat([cmdBuffer, temp]);

    });

    // now, we need to prepend the length and the message type
    temp = new Buffer(4);
    temp['writeUInt16' + endian](cmdBufferLength + 8);
    temp['writeUInt16' + endian](cmdType, 2);

    cmdBuffer = Buffer.concat( [temp, cmdBuffer] );

    return cmdBuffer;

}

var parser = through2(function (chunk, enc, callback) {

    var dataMessage = parseMessage(chunk);
    this.push(dataMessage);

    callback();
});

module.exports = {
    parser: parser,
    cmdBuffer: createCommandBuffer
};