/**
 * Created by Chad on 11/1/2014.
 */
socketio.on('broadcast', function(message){
    console.log("command message: " + message);
    if (message.command=="tessel"){
        $.get(message.url, function(data, status){
            console.log("GET status:" + status + " : " + data);
            socketio.emit("broadcast", {command: "tesselResult", data: data, room: room});
        })
    }
});