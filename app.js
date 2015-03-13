var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var through2 = require('through2');
var fs = require('fs');

var dump = fs.createWriteStream('dump');

var header  = new Buffer([0x44, 0x33, 0x22, 0x11]);
var trailer = new Buffer([0xBB, 0xCC, 0xDD, 0xEE]);


function MSGParser(startDelimiter, tailDelimiter, msgLength) {

    var _sync = false;
    var previous = new Buffer(0);

    return function(emitter, buffer) {

        var startBuffer,tailBuffer, message;

        buffer = Buffer.concat([previous, buffer]);

        var index = 0;
        while (!_sync && index < (buffer.length - startDelimiter.length + 2) ) {
            startBuffer = buffer.slice(index, index + startDelimiter.length);
            if( startBuffer.equals(startDelimiter) ) {
                _sync = true;
                msgLength = buffer.readUInt16BE(index + startDelimiter.length);
            } else {
                index++;
            }
        }

        while (_sync && index < buffer.length - startDelimiter.length - tailDelimiter.length - msgLength - 1) {

            startBuffer = buffer.slice( index,
                index+startDelimiter.length);

            msgLength = buffer.readUInt16BE(index + startDelimiter.length);
            //console.log('Length: ', msgLength);
            tailBuffer = buffer.slice( index+startDelimiter.length+msgLength,
                index+startDelimiter.length+msgLength+tailDelimiter.length);

            if (startBuffer.equals(startDelimiter) && tailBuffer.equals(tailDelimiter)) {
                index += startDelimiter.length;
                message = buffer.slice(index, index+msgLength+2 );
                emitter.emit( 'data', message );
                //console.log(message);
                index += msgLength + tailDelimiter.length;
            }
            else {
                index += startDelimiter.length;
                _sync = false;
            }
        }

        previous = buffer.slice(index, buffer.length);

    }
}


var sp = new SerialPort("/dev/tty.usbmodemfa1231", {
    baudrate: 115200,
    parser: MSGParser(header, trailer, 4*15+2)
}, false); // this is the openImmediately flag [default is true]

sp.open(function (error) {
    if (error) {
        console.log('failed to open: ' + error);
    }
    else {
        console.log('open');
        sp.flush(function (err) {
            if (err) console.log('could not flush: ', err);
            sp
                .pipe(through2(function(chunk, enc, callback){

                    var startWord = 2;
                    var length = chunk.readUInt16BE(0, true);
                    var output = {
                        timeStamp: chunk.readUInt32LE(startWord, true),
                        adcInput : chunk.readFloatLE(startWord+4, true),
                        pidOutput: chunk.readFloatLE(startWord+8, true),
                        setPoint : chunk.readFloatLE(startWord+12, true),
                        dispKp: chunk.readFloatLE(startWord+16, true),
                        dispKi: chunk.readFloatLE(startWord+20, true),
                        dispKd: chunk.readFloatLE(startWord+24, true),
                        kp: chunk.readFloatLE(startWord+28, true),
                        ki: chunk.readFloatLE(startWord+32, true),
                        kd: chunk.readFloatLE(startWord+36, true),
                        ITerm: chunk.readFloatLE(startWord+40, true),
                        DTerm: chunk.readFloatLE(startWord+44, true),
                        lastInput: chunk.readFloatLE(startWord+48, true),
                        outMin: chunk.readFloatLE(startWord+52, true),
                        outMax: chunk.readFloatLE(startWord+56, true),
                        controllerDirection: chunk.readUInt8(startWord+60, true),
                        enable: chunk.readUInt8(startWord+61, true)
                    };

                    if (length > 64) {
                        output.extra = chunk.readFloatLE(startWord+62, true);
                    }
                    //console.log('Debug: ',  output);
                    this.push(JSON.stringify(output)+'\n');
                    callback();
                }))
                .pipe(process.stdout);

        });
    }
});

