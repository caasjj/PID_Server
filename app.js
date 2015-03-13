var arduinoCom = require('./lib/arduino-com.js');

var count = 0;

var command = {
    type: 2,
    enable: false
}


arduinoCom({baudRate: 115200}, function(err, stream, writer) {
    if (err) return err;

    stream.pipe(process.stdout);

    //setInterval( function() {
    //    writer.write(command);
    //}, 2000);


});

arduinoCom._port.on('SyncFound', function() { console.log('Found Sync'); } );
arduinoCom._port.on('disconnect', function() { console.log('Disconnected'); } );
arduinoCom._port.on('SyncLost', function() { console.log('Lost Sync'); } );

