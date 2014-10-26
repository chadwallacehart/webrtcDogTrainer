var debug = require('debug')('webrtcDogRemover');
var express = require('express.io')();
var router = express.http(); //.io();

/* GET home page. */
router.get('/', function(req, res) {
    debug("Main monitor page - " + req.session.id);
    //had to redirect since rendering was not passing var
    res.redirect('/monitor');
});

router.get('/monitor', function(req, res) {
    debug("Main monitor page - " + req.session.id);
    res.render('monitor', {sessId: req.session.id});
});

router.get('/remote/:room', function(req, res) {
    res.render('remote', {room: req.params.room});
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

//TO DO: figure why I need this
router.get('/video/:fileName', function(req, res) {
    var fileName = req.params.fileName;

    var options = {
        root: __dirname + '/uploads/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    res.sendfile(fileName + '.webm', options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', fileName + '.webm');
        }
    });
});

module.exports = router;
