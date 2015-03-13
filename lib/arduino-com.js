var SerialPort = require('serialport').SerialPort;
var through2 = require('through2');

var writer = {};

writer.write = function(command) {

    var msgLength, buffer;

    switch(command.type) {

        case 2:
            msgLength = 4;
            buffer = new Buffer(msgLength);
            buffer.writeUInt16BE(msgLength, 0);
            buffer.writeUInt8(command.type, 2);
            buffer.writeUInt8(command.enable, 3);
            break;
        default:
            break;
    }

    writer._port.write(buffer);

}

function FindFrame(startDelimiter, tailDelimiter) {

    var _sync = false;
    var previous = new Buffer(0);
    var msgLength;

    return function (emitter, buffer) {

        var startBuffer, tailBuffer, message, splitMsg;;

        buffer = Buffer.concat([previous, buffer]);

        var index = 0;
        while (!_sync && index < (buffer.length - startDelimiter.length + 3)) {
            startBuffer = buffer.slice(index, index + startDelimiter.length);
            if (startBuffer.equals(startDelimiter)) {
                _sync = true;
                emitter.emit('SyncFound');
                //msgLength = buffer.readUInt16BE(index + startDelimiter.length);
            } else {
                index++;
            }
        }

        // Make sure we have enough data in the buffer to read a delimiter and a 2 byte length
        while (_sync && index < buffer.length - startDelimiter.length - 2 ) {

            // read the message length
            msgLength = buffer.readUInt16BE(index + startDelimiter.length);

            // if we don't have enough data to read the header, body and delimiter, bail for next round
            if ( index >= buffer.length - startDelimiter.length - tailDelimiter.length - msgLength ) {
                break;
            }
            startBuffer = buffer.slice(index,
                index + startDelimiter.length);

            msgLength = buffer.readUInt16BE(index + startDelimiter.length);
            //console.log('Length: ', msgLength);
            tailBuffer = buffer.slice(index + startDelimiter.length + msgLength,
                index + startDelimiter.length + msgLength + tailDelimiter.length);

            if (startBuffer.equals(startDelimiter) && tailBuffer.equals(tailDelimiter)) {
                index += startDelimiter.length;
                message = buffer.slice(index, index + msgLength + 2);
                emitter.emit('data', message);
                //console.log(message);
                index += msgLength + tailDelimiter.length;
            }
            else {
                index += startDelimiter.length;
                _sync = false;
                emitter.emit('SyncLost');
            }
        }

        previous = buffer.slice(index, buffer.length);

    }
}

function parseDataMessage(chunk, length) {

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
        enable: chunk.readUInt8(startWord, true)
    };

    return JSON.stringify(output) + '\n';
}

function Communicator(config, cb) {

    if (typeof config === "function") {
        cb = config;
        config = {};
    }

    //var _header  = new Buffer(config.header || [0x44, 0x33, 0x22, 0x11]),
    //    _trailer = new Buffer(config.trailer || [0xBB, 0xCC, 0xDD , 0xEE]),
    var _header  = new Buffer(config.header || [0x44, 0x33]),
        _trailer = new Buffer(config.trailer || [0xBB, 0xCC]),
         _port   = new SerialPort(config.port || "/dev/tty.usbmodemfa1231", {
            baudrate: config.baudRate || 500000,
            parser: FindFrame(_header, _trailer)
        }, false);

    Communicator._port = _port;
    writer._port = _port;

    _port.open(function (error) {

        if (error) return cb(error);

            _port.flush(function (err) {
                if (err) return cb(err)
                cb(null,
                   _port.pipe(through2(function (chunk, enc, callback) {

                        var length = chunk.readUInt16BE(0, true);
                        var msgType = chunk.readInt8(2, true);
                        var startWord = 3;

                        switch (msgType) {
                            case 1:
                                var dataMessage = parseDataMessage(chunk.slice(startWord) );
                                this.push(dataMessage);
                                break;

                            case 2:
                                var dataMessage = parseEchoMessage(chunk.slice(startWord) );
                                this.push(dataMessage);
                                break;

                            default:
                                this.push('Bad Message Type!');
                                break;
                        }

                        callback();

                   })),
                   writer
                );
            });

    });


}

module.exports = Communicator;



/***

 Protocol:        - numBytes:
   Header Sync    - 2
   MessageLength  - 2
   MessageType    - 1
   MessageBody    - N (max 29)
   Trailer Sync   - 2

 Messages to send to PID Controller:

 0. Configure
     Type: 0
     Body:  byte adcChannel        (ADC Channel to sample)
            integer sampleRateHz   (ADC Sample rate to read samples at)
            byte updateRatio       (PID loop run once every updateRatio samples from ADC)
            byte doEcho            (0/1 don't/do echo back serial commands
            byte diagLedPin        (digital pin to use for diagnostic LED)

 1. Configure Limits
     Type: 0
     Body: float MaxOutput
           float MinOutput

 2. Start/Stop loop
     Type: 1
     Body: byte 0/1 to disable/enable loop

 3. Set Output PWM to a value
     Type: 2
     Body: float PWM value
           byte 0/1 to disable/enable loop

 4. Set loop constants
     Type: 3
     Body: float Kp
           float Ki
           float Kd
           float KpAggressive
           float KiAggressive
           float kdAggressive
           int  polarity (1/-1 for positive/negative)
           float aggressiveModeCutoff

 5. Configure Software PWM / Hardware PWM
     Type: 4
     Body: DAC Channel (-1: use PWM)
           byte         PinNumber   (Digital Pin number to use for PWM)
           unsigned int Period      (PWM Period in ms)
           unsigned int Resolution  (PWM number of bits)
 ***/