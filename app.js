var express = require('express.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var fs = require('fs');
var debug = require('debug')('webrtcDogRemover');
var twilioapp = require('./twilioapp');

var app = express();
app.http().io();

var routes = require('./routes/index');
var twilioRoutes = require('./routes/twilio');
//var socketRoutes = require('./routes/socket')(app); //moved to below

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');             //had to change this from ejs

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));    //this not working
app.use(express.session({secret: process.env.sessionSecret}));

/********************ROUTES****************************/

app.use('/', routes);
app.use('/', twilioRoutes);

//object to make sure routes don't get flooded by teh same session
var fileNames = [];

// Setup the ready route, join room and broadcast to room.
app.io.route('join', function(req) {
    req.io.join(req.data);
    req.io.room(req.data).broadcast('announce', {
        message: 'New client in the ' + req.data + ' room.'
    });
    debug("New client in the " + req.data + " room. ");
});

app.io.route('command', function(req){
    debug("command: " + req.data.command + " for room " + req.data.room);
    //@ToDo - get the right room ID
    req.io.room(req.data.room).broadcast("command", req.data.command);
});

//Wasn't able to get these to work in a separate route module
app.io.route('image', function(req){

    var sid = req.session.id;
    var filetype = 'png';
    var filename = sid + '.'+ filetype;

    //only allow one alert per session for now
    if (fileNames.indexOf(filename) != -1){
        debug("repeat Image alert attempt");
        return
    }
    else{
        fileNames.push(filename);
    }

    req.io.emit('status', "saving image");
    writeToDisk(req.data.dataURL, sid + '.'+ filetype);

    var mediaUrl;
    if(process.env.NODE_ENV === 'development'){
        mediaUrl= 'https://www.petlegaciesbcs.com/wp-content/uploads/2014/07/english-bulldog-6-years-old-sitting-in-front-of-white-background.jpg';
    }
    else{
        mediaUrl = app.get('fullHostUrl') + '/' + sid;
    }

    debug("MMS mediaUrl: " + mediaUrl );

    var msg = "Your dog is on the couch! Go here to see:\n" + app.get('fullHostUrl') + '/remote/' + sid;
    //twilioapp.mms(msg, process.env.testPhone, mediaUrl);
});

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
    if (req.data.video) {
        writeToDisk(req.data.video.dataURL, fileName);
        //merge(socket, fileName);  //replace this if  want to use audio with Chrome
    }
    req.io.room(req.session.id).broadcast('videoReady', app.get('fullHostUrl') + '/video/' + fileName);

});

function writeToDisk(dataURL, fileName) {
    debug("About to write " + fileName);

    var fileExtension = fileName.split('.').pop(),
        fileRootNameWithBase = './uploads/' + fileName,
        filePath = fileRootNameWithBase,
        fileID = 2,
        fileBuffer;

    //increment file name if it already exists
    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase.split('.')[0] + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    dataURL = dataURL.split(',').pop();
    fileBuffer = new Buffer(dataURL, 'base64');
    fs.writeFileSync(filePath, fileBuffer);

    debug('filePath:' +  filePath);
}

//just for testing Socket.io
if(app.get('env') === 'development') {

    app.io.configure("development", function(){
        app.io.set('log level 1');
    });

    app.get('/socket', function (req, res) {
        res.render('sockettest');
        urlMsg = req.params.message;
    });

    app.io.route('ready', function(req){
        debug("incoming 'ready' on socket");
        req.io.emit('talk', {message: "socket server is alive"});

    });
}

//app.use('/', socketRoutes);
//app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(logger('dev'));
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;