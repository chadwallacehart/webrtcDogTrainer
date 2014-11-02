/**
 * Created by Chad on 11/2/2014.
 */

    //Call a rest command - used for ROVER control
$('#execute').click(function(){
    $.get($("#restUrl").val(), function(data, status){
        console.log("GET status:" + status + " : " + data);
        socketio.emit("broadcast", {command: "tessel", url: $("#restUrl").val(), room: room});
    })
});