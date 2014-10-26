/**
 * Created by Chad on 10/25/2014.
 */

///////////////////////////////////////////
//            Twilio setup               //
///////////////////////////////////////////

var debug = require('debug')('webrtcDogRemover');
var accountSid = process.env.twilioSid;
var authToken = process.env.twilioToken;

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

var twilioPhone = process.env.twilioPhone;

exports.mms = function(msg, to, url){

    client.messages.create({
        to: to,
        from: twilioPhone,
        body: msg,
        MediaUrl: url
    }, function (err, message) {
        if (err)
            debug(err);
        debug("MMS ID: " + message.sid);
    });
    debug("sent MMS");
};

exports.sms = function(smsto, smsmsg){
    client.messages.create({
        to: smsto,
        from: twilioPhone,
        body: smsmsg
    }, function (err, message) {
        if (err)
            debug(err);
        debug("SMS ID:" + message.sid);
    });
};
