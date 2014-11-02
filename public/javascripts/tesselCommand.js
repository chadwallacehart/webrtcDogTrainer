/**
 * Created by Chad on 11/2/2014.
 */

    //Call a rest command - used for ROVER control
var room = location.pathname.split('/')[2]; //pull the roomname from the url
$('#execute').click(function(){
    socketio.emit("broadcast", {command: "tessel", url: $("#restUrl").val(), room: room});

    socketio.on('broadcast', function(message){
        console.log("broadcast message: " + JSON.stringify(message));
        if (message.command=="tesselResult"){
                console.log("Tessel result: "  + message.data);
        }
    });
});

