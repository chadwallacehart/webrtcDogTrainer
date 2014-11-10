/**
 * SimpleWebRTC setup
 * Created by Chad on 10/25/2014.
 */

$(document).ready( function() {

    var video = $('#localVideo')[0];    //use var so we only call jQuery selectors once
    var w =  1280,                      //video width
    h = 720;                            //video width

    var constraints = {
        audio: true,
        video: {
            mandatory: { minWidth: w *.5, minHeight: h *.5 },
            optional: [ {width: w}, {height: h}]
        }
    };

    webrtc = new SimpleWebRTC({
        localVideoEl: 'localVideo',     // the id/element dom element that will hold "our" video
        remoteVideosEl: 'remoteVideos', // the id/element dom element that will hold remote videos
        autoRequestMedia: true,         // immediately ask for camera access
        media: constraints
    });

    video.onloadeddata = function(){
        mediastream = webrtc.webrtc.localStreams[0];
        $('#startButton').show();       //let the user start when self-video is loaded
    };

    video.onloadedmetadata = function(){
        console.log("requested video size was: " + w + " x " + h );
        console.log("returned video was is: " + video.videoWidth + " x " + video.videoHeight);
    };

});
