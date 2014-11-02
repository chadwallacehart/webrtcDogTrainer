/**
 * Route for express.io socket messages
 * Created by Chad on 10/25/2014.
 */
var debug = require('debug')('webrtcDogTrainer');
//var express = require('express.io')();
//var app = express.http().io();
var twilioapp = require('../twilioapp');
var fs = require('fs');

module.exports = function(app){

    app.io.route('video', function(req){

        debug("incoming socket - video");
        req.io.emit('status', "saving video");

        //To DO: write the filename based on teh data.audio.type
        var filetype = 'webm';
        //fileId = uuid.v4();
        //fileName = fileId + '.' + filetype;

        fileName = req.session.id + '.' + filetype;

        writeToDisk(req.data.audio.dataURL, fileName);

        // if it is chrome
        if (data.video) {
            writeToDisk(req.data.video.dataURL, fileName);
            //merge(socket, fileName);  //replace this if  want to use audio with Chrome
        }
        req.io.emit('finished', hostUrl + '/' + fileName);

    });

    app.io.route('image', function(req){
        req.io.emit('status', "saving image");
        var filetype = 'png';
        sid = req.session.id;
        writeToDisk(req.data.dataURL, sid + '.'+ filetype);

        var mediaUrl = req.app.get('fullHostUrl') + '/' + sid + '.png';
        debug("mediaUrl:" + mediaUrl );

        var msg = "Your dog is on the couch! Go here to see:\n" + req.app.get('fullHostUrl') + '/remote/' + sid;
        twilioapp.mms(msg, process.env.testPhone, mediaUrl);
    });

    function writeToDisk(dataURL, fileName) {
        debug("About to write" + fileName);

        var fileExtension = fileName.split('.').pop(),
            fileRootNameWithBase = './uploads/' + fileName,
            filePath = fileRootNameWithBase,
            fileID = 2,
            fileBuffer;

        while (fs.existsSync(filePath)) {
            filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
            fileID += 1;
        }

        dataURL = dataURL.split(',').pop();
        fileBuffer = new Buffer(dataURL, 'base64');
        fs.writeFileSync(filePath, fileBuffer);

        debug('filePath:', filePath);
    }


    //just for testing Socket.io
    if(app.get('env') === 'development') {

        app.io.configure("development", function(){
            app.io.set('log level 1');
        });

        var urlMsg;

        app.get('/socket', function (req, res) {
            res.render('sockettest');
            urlMsg = req.params.message;
            //req.io.route('ready');
            app.io.emit("talk", "socket server started");
        });

        app.io.route('ready', function(req){
            debug("incoming 'ready' on socket");
            req.io.emit('talk', {message: "socket server is alive"});
        })


    }
}
//module.exports = app;