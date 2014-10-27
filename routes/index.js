var debug = require('debug')('webrtcDogRemover');
var express = require('express.io')();
var router = express.http(); //.io();


var rootDir = process.cwd();
var sids = [];  //storage for our session ID's

/* GET home page. */
router.get('/', function(req, res) {
    debug("Main monitor page - " + req.session.id);
    //had to redirect since rendering was not passing var
    res.redirect('/monitor');
});

router.get('/monitor', function(req, res) {
    debug("Main monitor page - " + req.session.id);
    res.render('monitor', {sessId: req.session.id});
    sids.push(req.session.id);
});

router.get('/remote/:room', function(req, res) {
    res.sendfile(rootDir + '/public/remote.html');
});


//Test routes for Twilio we don't want in production
if(router.get('env') === 'development') {
//just for testing
    router.get('/sid', function (req, res) {
        res.send("Your session ID is: " + req.session.id);
    });

    router.get('/test', function (req, res) {
        res.send("something");
    });

    router.get('/echo/:message', function(req, res){
        res.send(req.params.message);
    });
}

//serve images url for twilio MMS based on ssid
router.get('/image/:imageId', function(req, res){

    var imageId = req.params.imageId;
    //var ssidCheck = fileName.split('.')[0];
    debug("ssidCheck: +" + imageId);

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
            debug('Sent:', fileName + '.png');
        }
    });
});

//returns a page with the video file
router.get('/video/:fileName', function(req, res) {
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
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', fileName);
        }
    });
});

module.exports = router;
