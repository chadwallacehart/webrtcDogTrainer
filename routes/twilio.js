/**
 * Routes used used by Twilio
 * Created by Chad on 10/25/2014.
 */
var debug = require('debug')('webrtcDogRemover');
var express = require('express.io')();
var router = express.http().io();
var twilioapp = require('../twilioapp');

//Test routes for Twilio we don't want in production
if(router.get('env') === 'development') {

    var testPhone = process.env.testPhone;
    debug("debug phone #: " + testPhone);

//SMS test message
    router.get('/sms', function (req, res) {
        twilioapp.sms(testPhone, "bugging you with sms! \n" +  req.session.id);
        res.end("SMS sent");
    });

//MMS route for testing
    router.get('/mms', function (req, res) {
        mediaLink = 'http://upload.wikimedia.org/wikipedia/commons/f/f7/UKC_Olde_English_Bulldogge_at_8_years_old.jpg';

        var message = "You have an alert! \n" + req.session.id + "\nGo here to do something about it: \n" + req.app.get('fullHostUrl') + '/remote.html';
        twilioapp.mms(message, testPhone, mediaLink);
        res.end("MMS sent");
    });
}

//serve images url for twilio MMS
router.get('/img/:fileName', function(req, res){

    var fileName = req.params.fileName;
    var options = {
        root: __dirname + '/uploads/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    res.sendfile(fileName + '.png', options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', fileName + '.png');
        }
    });

});

module.exports = router;