/**
 * Monitor client module for recording
 * Created by Chad on 10/25/2014.
 */
/***********FOR RECORDING****************/
var mediastream, webrtc = null;            //used by recorder
var socketio = io.connect();
var motion = new Motion( $('#localVideo')[0], 15, 5 );

//Use socket.io to connect and join a room
socketio.on('connect', function() {
    console.log("socket connected");
    socketio.emit('join', rid);
});

//Announce when other client joins for debugging
socketio.on('announce', function(data){
    console.log(data.message);
});

//server should send the video file URL
socketio.on('command', function(message){
    console.log("command message: " + message);
    if (message=="record"){
        window.recordRTC = RecordRTC(mediastream);
        recordRTC.startRecording();
    }
    if (message=="stop"){
        recordRTC.stopRecording(function () {
            recordRTC.getDataURL(function (audioVideoWebMURL) {
                var files = {
                    audio: {
                        type: recordRTC.getBlob().type || 'audio/wav',
                        dataURL: audioVideoWebMURL
                    }
                };
                socketio.emit('video', files);
                console.log("file type is " + recordRTC.getBlob().type);
            });
        });
    }
});


function countdown(time, element, callback) {
    console.log("countdown for " + time);
    element.prop('disabled', 'disabled');
    var t = time;
    var origtext = element.text();
    var timer = setInterval(function () {
        if (t == 0) {
            clearInterval(timer);
            element.text(origtext);
            callback();
        }
        else
        {
            //console.log("tick");
            element.text(t);
            t--;
        }
    }, 1000);
}

$('#startButton').click(function() {

    countdown($('#timer').val() || 0, $('#startButton'), function(){
        $('#startButton').hide();
        $('#stopButton').show();
        motion.start();
    });



    $(window).on('motion', function(){
        $("#localVideo").fadeToggle(50);
        $("#localVideo").fadeToggle(50);
    });

    $(window).on('alert', function(){
        console.log('Alert');

        webrtc.joinRoom(rid);
        console.log("just joined - " + rid);

        //take a snapshot and send it on the socket
        socketio.emit('image',
                takePicture($("#localVideo")[0])
        );

        motion.stop();

        $('#startButton').show();
        $('#stopButton').hide();

    });
});

$('#stopButton').click(function() {
    $('#startButton').show();
    $('#stopButton').hide();
    motion.stop();
    $('#startButton').show();
    $('#stopButton').hide();
});



//Take a still photo and send it up
//Inspiration: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos
function takePicture(sourceImg) {
    var canvas = document.createElement("canvas");
    //set picture to native size of video
    canvas.width = sourceImg.videoWidth;
    canvas.height = sourceImg.videoHeight;
    canvas.getContext('2d').drawImage(sourceImg, 0, 0, sourceImg.videoWidth, sourceImg.videoHeight);
    var data = canvas.toDataURL('image/png');

    var img = {
        type: 'image/png',
        dataURL: data
    };
    return (img);
}