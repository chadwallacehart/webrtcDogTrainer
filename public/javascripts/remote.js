/**
 * Created by Chad on 10/26/2014.
 */
var room = location.pathname.split('/')[2]; //pull the roomname from the url

socketio = io.connect();
socketio.emit('join', room);

console.log("room is " + room);
var webrtc = new SimpleWebRTC({
    localVideoEl: 'localVideo',
    remoteVideosEl: 'remoteVideos',
    media: {audio: true, video: false},
    autoRequestMedia: true});

webrtc.on('readyToCall', function () {
    webrtc.joinRoom(room);
    console.log('Joined room ' + room);
});

socketio.on('broadcast', function(data){
    console.log("broadcast: " + JSON.stringify(data));
});

socketio.on('videoReady', function(data){
    console.log("command: " + data);
    window.open(data);
});

$("#record").click(function(){
    console.log("record");
    socketio.emit("broadcast", {command: "record", room: room});
    $("#stop").show();
    $("#record").hide();
});

$("#stop").click(function(){
    console.log("stop");
    socketio.emit("broadcast", {command: "stop", room: room});
    $("#stop").prop("disabled",true)
});