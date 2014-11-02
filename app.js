var express = require('express.io');        //normal express routes + socket.io routing
var path = require('path');
var favicon = require('serve-favicon');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');
var shortId = require('shortid');           //used to generate unique IDs

var fs = require('fs');
var debug = require('debug')('webrtcDogTrainer');
var twilioapp = require('./twilioapp');

var app = express().http().io();        //Connect all these to app

//var routes = require('./routes/index');
var twilioRoutes = require('./routes/twilio');
//var socketRoutes = require('./routes/socket')(app); //moved to below

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');             //had to change this from ejs

app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));    //this not working

var adminId = "";                   //used for hold an admin room

/********************ROUTES****************************/

//app.use('/', routes);
app.use('/', twilioRoutes);

/* GET home page. */
app.get('/', function(req, res) {
    var uid = shortId.generate();
    debug("home");
    res.redirect('/monitor/' + uid);
});

app.get('/:' + process.env.adminAuth, function (req, res){
   adminId = shortId.generate();
   debug("Admin login");
   res.redirect('/monitor/' + adminId);
});

//Render the monitor page
app.get('/monitor/:room', function(req, res) {
    var room = req.params.room;
    debug("Main monitor page - room ID: " + room);
    if (room == adminId){
        res.render('tesselProxy',{roomId: room} );
    }
    else{
        res.render('monitor', {roomId: room});
    }
});

app.get('/remote/:room', function(req, res) {
    var room = req.params.room;
    if (room == adminId){
        res.render('tesselCommand' );
    }
    else{
        res.render('remote');
    }
});

//Test routes for Twilio we don't want in production
if(process.env.NODE_ENV === 'development') {
//just for testing

    global.db = [];         //define a fake global fake database object

    app.get('/sid', function (req, res) {
        res.send("Your session ID is: " + req.session.id);
    });

    app.get('/test', function (req, res) {
        res.send("something");
    });

    app.get('/echo/:message', function(req, res){
        res.send(req.params.message);
    });

    //fake database test - generate an id
    app.get('/db', function(req, res){
        var id = shortId.generate();
        global.db.push( {sid: id, rid: shortId.generate()});
        res.send(id);
        debug(global.db);
    });

    //fake database test - pull a value
    app.get('/db/:sid', function(req, res){
        var i = global.db.map(function(e) {return e.sid}).indexOf(req.params.sid);
        res.send(global.db[i].rid);
    });

}

//serve images url for twilio MMS
app.get('/image/:imageId', function(req, res){

    var imageId = req.params.imageId;
    //var ssidCheck = fileName.split('.')[0];
    debug("ImageId Check: +" + imageId);

    var options = {
        //root: __dirname + '../uploads/',
        root: __dirname + '/uploads/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    res.sendfile(imageId + '.png', options, function (err) {
        if (err) {
            debug(err);
            res.status(err.status).end();
        }
        else {
            debug('Sent:', imageId + '.png');
        }
    });
});

//returns a page with the video file
app.get('/video/:fileName', function(req, res) {
    var fileName = req.params.fileName;

    var options = {
        root: __dirname + '/uploads/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    res.sendfile(fileName, options, function (err) {
        if (err) {
            debug(err);
            res.status(err.status).end();
        }
        else {
            debug('Sent:', fileName);
        }
    });
});



// Setup the ready route, join room and broadcast to room.
app.io.route('join', function(req) {
    req.io.join(req.data);
    req.io.room(req.data).broadcast('announce', {
        message: 'New client in the ' + req.data + ' room.'
    });
    debug("New client in the " + req.data + " room. ");
});

//broadcast any incoming 'broadcast' message
app.io.route('broadcast', function(req){
    debug("command: " + req.data.command + " for room " + req.data.room);
    req.io.room(req.data.room).broadcast("broadcast", req.data.command);
});

//Wasn't able to get these to work in a separate route module
app.io.route('image', function(req){

    var imageId = shortId.generate();

    var filetype = 'png';
    var filename = imageId + '.'+ filetype;

    req.io.emit('status', "saving image");
    writeToDisk(req.data.image.dataURL, filename);

    //save to fake DB

    var mediaUrl;
    if(process.env.NODE_ENV === 'development'){
        mediaUrl= 'https://www.petlegaciesbcs.com/wp-content/uploads/2014/07/english-bulldog-6-years-old-sitting-in-front-of-white-background.jpg';
    }
    else{
        mediaUrl = app.get('fullHostUrl') + '/image/' + imageId;
    }

    debug("MMS mediaUrl: " + mediaUrl );


    //need the right room ID here
    var msg = "Your dog is on the couch! Go here to see:\n" + app.get('fullHostUrl') + '/remote/' + req.data.room;
    twilioapp.mms(msg, req.data.alertPhone, mediaUrl);
});

app.io.route('video', function(req){

    debug("incoming socket - video");
    req.io.emit('status', "saving video");

    var vidId = shortId.generate();

    //To DO: write the filename based on teh data.audio.type
    var filetype = 'webm';


    fileName = vidId + '.' + filetype;

    writeToDisk(req.data.audio.dataURL, fileName);

    // if it is chrome
    if (req.data.video) {
        writeToDisk(req.data.video.dataURL, fileName);
        //merge(socket, fileName);  //replace this if  want to use audio with Chrome
    }
    debug("recording url:" + app.get('fullHostUrl') + '/video/' + fileName);
    req.io.room(req.data.room).broadcast('videoReady', app.get('fullHostUrl') + '/video/' + fileName);

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
    //app.use(logger('dev'));
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
