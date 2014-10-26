var express = require('express.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var debug = require('debug')('webrtcDogRemover');

var app = express();

var routes = require('./routes/index');
var twilioRoutes = require('./routes/twilio');
var socketRoutes = require('./routes/socket');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');             //had to change this from ejs

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.session({secret: process.env.sessionSecret}));


/*
//just for testing Socket.io
if(app.get('env') === 'development') {

    app.io.configure("development", function(){
        app.io.set('log level 1');
    });

    var urlMsg;

    app.get('/socket', function (req, res) {
        res.render('sockettest');
        urlMsg = req.params.message;
        //req.io.route('ready');
        app.io.emit("talk", "socket server started");
    });

    app.io.route('ready', function(req){
        debug("incoming 'ready' on socket");
        req.io.emit('talk', {message: "socket server is alive"});
    })
}

*/

app.use('/', routes);
app.use('/', twilioRoutes);
app.use('/', socketRoutes);
//app.use('/users', users);

app.http().io();

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
