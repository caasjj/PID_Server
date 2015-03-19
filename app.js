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

    // ENABLE_SAMPLER_CMD
    setTimeout( function() {
        var cmd = arduinoCmd(10, {});

        arduino.sendCommand(cmd);
        console.log('Enabled sampler!');
    }, 2000);


    //SET_LOOP_K_CMD
    setTimeout( function() {

        var cmd = arduinoCmd(13, {
            kp: 1,
            ki: 2,
            kd: 3,
            kpAggressive: 5,
            kiAggressive: 7,
            kdAggressive: 6,
            aggressiveCutoffPoint: 10,
            loopUpdateRatio: 5,
            loopPolarity: -1
        });

        arduino.sendCommand(cmd);

    }, 3000);

    var enabled=true;
    var on = arduinoCmd(16, {});
    var off = arduinoCmd(16, {});
    var redo = arduinoCmd(12, {
        pulseWidth: 2,
        numBits: 4,
        'pwmValue': 15
    });
    // SET_SETPOINT_CMD
    setTimeout(function() {
        arduino.sendCommand(redo);
    }, 3000);

    //setInterval( function() {
    //
    //    if (enabled) {
    //        arduino.sendCommand(on);
    //        enabled = false;
    //    }
    //    else
    //    {
    //        arduino.sendCommand(off);
    //        enabled = true;
    //    }
    //
    //
    //}, 4000);

    //setInterval( function() {
    //
    //    var cmd = arduinoCmd(14, {});
    //    arduino.sendCommand(cmd);
    //
    //}, 1000);

});
