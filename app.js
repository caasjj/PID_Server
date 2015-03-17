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

    //var enabled = true;
    //
    //setInterval( function() {
    //
    //    var cmd = arduinoCmd(17, {
    //        kp: 1.0,
    //        ki: 2.0,
    //        kd: 3.0,
    //        kpAggressive: 2.0,
    //        kiAggressive: 4.0,
    //        kdAggressive: 6.0,
    //        aggressiveCutoffPoint: 10.0,
    //        loopUpdateRatio: 5,
    //        loopPolarity: 0
    //    });
    //
    //    arduino.sendCommand(cmd);
    //

    setTimeout( function() {
        var cmd = arduinoCmd(10, {});

        arduino.sendCommand(cmd);
        console.log('Enabled sampler!');
    }, 2000);

    var enabled = 0;

    setInterval( function() {

        var cmd = arduinoCmd(18+enabled);
        enabled = +(!enabled);
        arduino.sendCommand(cmd);

    }, 1100);



});
