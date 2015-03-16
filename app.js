GLOBAL._appStartTime = Date.now();

var arduinoCom = require('./lib/arduino-com.js');
var arduinoMessager = require('./lib/arduino-msgApi.js');

var arduinoMsg = arduinoMessager.parser;
var arduinoCmd = arduinoMessager.cmdBuffer;

arduinoCom({baudRate: 500000}, function (err, arduino) {

    if (err) return err;

    arduino.on('SyncFound', function () {
        console.log('Found Sync');
    });
    arduino.on('disconnect', function () {
        console.log('Disconnected');
    });
    arduino.on('SyncLost', function () {
        console.log('Lost Sync');
    });

    arduino

        .pipe(arduinoMsg)

        .pipe(process.stdout);


    var enabled = false;

    setInterval( function() {

        var cmd = arduinoCmd(16, {
            enabled: enabled
        });

        enabled = !enabled;
        arduino.sendCommand(cmd);

    }, 5000);

});
