var arduinoCom = require('./lib/arduino-com.js');
var arduinoMsgParser = require('./lib/arduino-msgParser.js');

arduinoCom({baudRate: 115200}, function (err, arduino) {

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