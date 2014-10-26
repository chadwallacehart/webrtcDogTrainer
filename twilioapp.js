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
/*
    var mediaLink;

    if(process.env.NODE_ENV === 'development'){
        mediaLink = 'http://upload.wikimedia.org/wikipedia/commons/f/f7/UKC_Olde_English_Bulldogge_at_8_years_old.jpg';
    }
    else{
        mediaLink = app.get('fullHostUrl') + '/' + sid + '.png';
    }
    debug("Media file is: " + mediaLink);
*/
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
