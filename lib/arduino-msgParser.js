var through2 = require('through2');
var messageStructures = require('./arduino-msgStructures.js').messages;

var endian = 'LE';

var byteLengths = {
    'readInt8': 1,
    'readUInt8': 1,
    'readInt16': 2,
    'readUInt16': 2,
    'readUInt32': 4,
    'readFloat': 4
};

var typesToReaderMap = {
    'byte': 'readInt8',
    'bool': 'readUInt8',
    'char': 'readUInt8',
    'int': 'readInt16',
    'unsigned int': 'readUInt16',
    'unsigned long': 'readUInt32',
    'float': 'readFloat'
};


function parseMessage(chunk) {

    var msgLength = chunk.readUInt16BE(0, true),
        msgType = chunk.readInt8(2, true),
        index = 3,
        output = {
            type: msgType
        },
        length;

    msgStructure = messageStructures[msgType];

    if ( !msgStructure) {
        output.error = 'Unknown message structure';
        return JSON.stringify(output) + '\n';
    }

    msgStructure.forEach(function (msgField) {
        var fieldName = Object.keys(msgField)[0],
            fieldValue = msgField[fieldName],
            bufferMethod = typesToReaderMap[fieldValue];
        length = byteLengths[bufferMethod];
        msgLength -= length;
        if (length > 1) bufferMethod += endian;
        if (index + length > chunk.length) return null;
        output[fieldName] = chunk[bufferMethod](index, true);
        index += length;
    });

    if (msgLength !== 3) {
        output.warn = 'Length mismatch in parser';
    }

    return JSON.stringify(output) + '\n';
}


var parser = through2(function (chunk, enc, callback) {

    var dataMessage = parseMessage(chunk);
    this.push(dataMessage);

    callback();
});

module.exports = parser;