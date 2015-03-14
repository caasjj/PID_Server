var through2 = require('through2');

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
    {'outMin':'float'},
    {'outMax':'float'},
    {'controllerDirection':'char'},
    {'enable':'char'}
];

var testMsgStructure = [
    {'timeStamp':'unsigned long'},
    {'data1':'float'},
    {'data2':'float'},
    {'count':'unsigned int'},
    {'enable': 'bool'}
];

function parseMessage(chunk, structure) {

    var output = {}, index = 0;

    structure.forEach( function(msgField) {
        var fieldName = Object.keys(msgField)[0],
            fieldValue = msgField[fieldName],
            bufferMethod = typesToReaderMap[fieldValue],
            length = byteLengths[bufferMethod];
            if (length>1) bufferMethod += endian;
            if (index + length > chunk.length ) return null;
            output[ fieldName ] = chunk[bufferMethod](index, true);
            index += length;
    })

    return JSON.stringify(output) + '\n';
}

function parseDataMessage(chunk) {

    var startWord = 0;
    var output = {
        timeStamp: chunk.readUInt32LE(startWord, true),
        adcInput: chunk.readFloatLE(startWord + 4, true),
        pidOutput: chunk.readFloatLE(startWord + 8, true),
        setPoint: chunk.readFloatLE(startWord + 12, true),
        dispKp: chunk.readFloatLE(startWord + 16, true),
        dispKi: chunk.readFloatLE(startWord + 20, true),
        dispKd: chunk.readFloatLE(startWord + 24, true),
        kp: chunk.readFloatLE(startWord + 28, true),
        ki: chunk.readFloatLE(startWord + 32, true),
        kd: chunk.readFloatLE(startWord + 36, true),
        ITerm: chunk.readFloatLE(startWord + 40, true),
        DTerm: chunk.readFloatLE(startWord + 44, true),
        lastInput: chunk.readFloatLE(startWord + 48, true),
        outMin: chunk.readFloatLE(startWord + 52, true),
        outMax: chunk.readFloatLE(startWord + 56, true),
        controllerDirection: chunk.readUInt8(startWord + 60, true),
        enable: chunk.readUInt8(startWord + 61, true)
    };

    return JSON.stringify(output) + '\n';
}

function parseEchoMessage(chunk) {

    var startWord = 0;

    var output = {
        length: chunk.readUInt16LE(startWord, true)
    };

    return JSON.stringify(output) + '\n';
}



var parser = through2( function(chunk, enc, callback){
    var length = chunk.readUInt16BE(0, true);
    var msgType = chunk.readInt8(2, true);
    var startWord = 3;

    switch (msgType) {
        case 1:
            //var dataMessage = parseDataMessage(chunk.slice(startWord));
            var dataMessage = parseMessage( chunk.slice(startWord), dataMsgStructure);
            this.push(dataMessage);
            break;

        case 2:
            var dataMessage = parseEchoMessage(chunk.slice(startWord));
            this.push(dataMessage);
            break;

        case 3:
            var dataMessage = parseMessage( chunk.slice(startWord), testMsgStructure);
            this.push(dataMessage);
            break;

        case 99:
            var dataMessage = parseEchoMessage(chunk.slice(startWord));
            this.push(dataMessage);
            break;

        default:
            this.push('Bad Message Type!');
            break;
    }

    callback();
});

module.exports = parser;