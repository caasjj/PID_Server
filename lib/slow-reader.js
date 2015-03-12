
var stream = require('stream').Transform;
var util = require('util');

function SlowReader() {
    stream.call(this, arguments);
}
util.inherits(SlowReader, stream);

var buf = new Buffer(128);

SlowReader.prototype._transform = function(chunk, encoding, cb){
    console.log(chunk.length);
    Buffer.concat(buf, chunk);
    if (buf.length > 100)
        this.push(buf);

    //buf.copy(chunk);
    //if (chunk.length >= 4)
    //    this.push(chunk.readFloatLE(0).toString(10)+'\n');
    //this.push(chunk.readUInt16BE(2,2).toString(10)+',');
    //this.push(chunk.readUInt16BE(4,2).toString(10)+',');
    //this.push(chunk);
    //setTimeout(cb, 100);
    cb();
};

//SlowReader.prototype._flush = function(cb){
//    console.log('flushed');
//    cb();
//};

module.exports = SlowReader;


