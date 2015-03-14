var arduinoCom = require('./lib/arduino-com.js');
var arduinoMsgParser = require('./lib/arduino-msgParser.js');

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

        .pipe(arduinoMsgParser)

        .pipe(process.stdout);

});
