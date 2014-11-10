/**
 * Created by Chad on 11/1/2014.
 */
socketio.on('broadcast', function(message){
    //console.log("tessel proxy: broadcast message: " + JSON.stringify(message));
    if (message.command=="tessel"){
        $.get(message.url, function(data, status){
            console.log("Tessel proxy GET status:" + status + " : " + data);
            socketio.emit("broadcast", {command: "tesselResult", data: data, room: room});
        })
    }
});T