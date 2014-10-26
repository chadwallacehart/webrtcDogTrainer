/**
 * Created by Chad on 10/25/2014.
 */
/*************FOR RECORDING****************/
var mediastream, webrtc = null;            //used by recorder
var socketio = io.connect();
var motion = new Motion( $('#localVideo')[0], 15, 5 );

socketio.on('connect', function() {
    console.log("socket connected");
});


$('#startButton').click(function() {
    $('#startButton').hide();
    $('#stopButton').show();

    motion.start();

    $(window).on('motion', function(){
        $("#localVideo").fadeToggle(50);
        $("#localVideo").fadeToggle(50);
    });

    $(window).on('alert', function(){
        console.log('Alert');

        window.recordRTC = RecordRTC(mediastream);
        recordRTC.startRecording();

        webrtc.joinRoom(sid);
        console.log("just joined - " + sid);

        takePicture($("#localVideo")[0]);

        //$('#stopButton').hide();
        stop();
    });
});

$('#stopButton').click(function() {
    $('#startButton').show();
    $('#stopButton').hide();
    stop();
});

function stop(){
    motion.stop();

    // get audio data-URL
    recordRTC.stopRecording(function () {

        recordRTC.getDataURL(function (audioVideoWebMURL) {
            var files = {
                audio: {
                    type: recordRTC.getBlob().type || 'audio/wav',
                    dataURL: audioVideoWebMURL
                }
            };
            socketio.emit('video', files);

            console.log("file type is" + recordRTC.getBlob().type);
        });
    });
}

//server should send the video file URL
socketio.on('finished', function(message){
    console.log("Server message: " + message);
    window.open(message);
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

    socketio.emit('image', img);
    console.log(img);
    return (img);
}