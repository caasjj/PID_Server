var SerialPort = require('serialport').SerialPort;
var through2 = require('through2');

var _header, _trailer;

function FindFrame(startDelimiter, tailDelimiter) {

    var _sync = false;
    var previous = new Buffer(0);
    var msgLength;

    return function (emitter, buffer) {

        var startBuffer, tailBuffer, message;

        buffer = Buffer.concat([previous, buffer]);

        var index = 0;
        while (!_sync && index < (buffer.length - startDelimiter.length + 3)) {
            startBuffer = buffer.slice(index, index + startDelimiter.length);
            if (startBuffer.equals(startDelimiter)) {
                _sync = true;
                emitter.emit('SyncFound');
            } else {
                index++;
            }
        }

        // Make sure we have enough data in the buffer to read a delimiter and a 2 byte length
        while (_sync && index < buffer.length - startDelimiter.length - 2 ) {

            // read the message length
            msgLength = buffer.readUInt16LE(index + startDelimiter.length);

            // if we don't have enough data to read the header, body and delimiter, bail for next round
            if ( index >= buffer.length - startDelimiter.length - tailDelimiter.length - msgLength ) {
                // HACK!!
                if (msgLength > 100) {
                    _sync = false;
                    emitter.emit('SyncLost');
                }
                break;
            }
            startBuffer = buffer.slice(index,
                index + startDelimiter.length);

            msgLength = buffer.readUInt16LE(index + startDelimiter.length);
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

function Communicator(config, cb) {

    if (typeof config === "function") {
        cb = config;
        config = {};
    }

    // we want these available to other functions in this module, so they
    // are defined at the top in module scope
    _header  = new Buffer(config.header || [0x44, 0x33]);
    _trailer = new Buffer(config.trailer || [0xBB, 0xCC]);

    var  _port = new SerialPort(config.port || "/dev/tty.usbmodemfa1231", {
            baudrate: config.baudRate || 500000,
            parser: FindFrame(_header, _trailer)
        }, false);


    _port.open(function (error) {

        if (error) return cb(error);

        _port.flush(function (err) {

            if (err) return cb(err);

            _port.sendCommand = sendCommand.bind(_port);

            cb(null, _port);

        });

    });

}

function sendCommand(cmdBuffer, waitForDrain, callback) {

    if (typeof waitForDrain === 'function') {
        callback = waitForDrain;
        waitForDrain = false;
    }

    var buffer = new Buffer(_header);
    buffer = Buffer.concat([buffer, cmdBuffer]);
    buffer = Buffer.concat([buffer,_trailer]);

    if (!waitForDrain) {
        this.write(buffer, callback);
    } else {
        this.write(buffer);
        this.drain(callback);
    }

}
module.exports = Communicator;

