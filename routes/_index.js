var debug = require('debug')('webrtcDogRemover');
var express = require('express.io')();
var router = express.http(); //.io();
var shortId = require('shortid');

var rootDir = process.cwd();

var app = require('../app');

//repplace "app.io.route" with "app.io.route"

/* GET home page. */
app.route('/', function(req, res) {
    debug("Home - session ID: " + req.session.id);
    //had to redirect since rendering was not passing var
    res.redirect('/monitor');
});

app.route('/monitor', function(req, res) {
    var uid = shortId.generate();

    //@ToDO change this to REDIS HSET like function
    global.db.push({sid: req.session.id, 'rid': uid, 'imgId': "", 'vidId': ""});
    debug(global.db);

    debug("Main monitor page - room ID: " + uid);
    res.render('monitor', {sessId: uid});
    //sids.push(req.session.id);
});

app.route('/remote/:room', function(req, res) {
    res.sendfile(rootDir + '/public/remote.html');
});


//Test routes for Twilio we don't want in production
if(app.route('env') === 'development') {
//just for testing
    app.route('/sid', function (req, res) {
        res.send("Your session ID is: " + req.session.id);
    });

    app.route('/test', function (req, res) {
        res.send("something");
    });

    app.route('/echo/:message', function(req, res){
        res.send(req.params.message);
    });

    //fake database test - generate an id
    app.route('/db', function(req, res){
        var id = shortId.generate();
        global.db.push( {sid: id, rid: shortId.generate()});
        res.send(id);
        debug(global.db);
    });

    //fake database test - pull a value
    app.route('/db/:sid', function(req, res){
        var i = global.db.map(function(e) {return e.sid}).indexOf(req.params.sid);
        res.send(global.db[i].rid);
    });

}

//serve images url for twilio MMS based on ssid
app.route('/image/:imageId', function(req, res){

    var imageId = req.params.imageId;
    //var ssidCheck = fileName.split('.')[0];
    debug("ImageId Check: +" + imageId);

    var options = {
        //root: __dirname + '../uploads/',
        root: rootDir + '/uploads/',
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
app.route('/video/:fileName', function(req, res) {
    var fileName = req.params.fileName;

    var options = {
        root: rootDir + '/uploads/',
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

module.exports = router;
