/**
 * Created by Chad on 10/26/2014.
 */
var room = location.search && location.search.split('remote/')[1];
console.log("room is " + room);
var webrtc = new SimpleWebRTC({
    localVideoEl: 'localVideo',
    remoteVideosEl: 'remoteVideos',
    media: {audio: true, video: false},
    autoRequestMedia: true});
webrtc.on('readyToCall', function () {
    webrtc.joinRoom(gotoRoom);
    console.log('Joined room ' + gotoRoom);
});