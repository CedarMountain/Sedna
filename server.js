/**
 * Test server
 * version 0.1.3
 * created by Greg Woodhouse on 12/05/15.
 */
var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');

var app = express();
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());

//simple middleware for logging requests
app.use(function (req, res, next) {
    util.log('%s %s', req.method, req.url);
    if (req.method == 'POST' || req.method == 'PUT') {
        util.log('content type: %s', req.headers['content-type']);
        util.log('request body: %s', JSON.stringify(req.body));
    }
    next();
});

//root path
app.get('/', function (req, res) {
    res.status(200).json({status: 'ok'});
});

//Retrieve a patient by id
app.get('/order/:id', function (req, res) {
    res.status(200).json({type: 'order', id: req.params.id});
});

//Update a specific patient
app.put('/order/:id', function (req, res) {
    if (!req.body) {
        return res.status(400).json({status: 'error', message: 'no request body'});
    }
    if (req.is('application/json')) {
        res.status(200).json({status: 'ok', message: 'update processed'});
    } else {
        res.status(415).json({status: 'error', message: 'media type not supported'});
    }
});

//Add a new patient
app.post('/order', function (req, res) {
    if (!req.body) {
        return res.status(400).json({status: 'error', message: 'no request body'});
    }
    if (req.is('application/json')) {
        //include the URL of the new patient in the response header
        res.location(util.format('%s://%s:%d/patient/1',req.protocol, req.hostname, app.get('port')));
        res.status(201).json({status: 'ok', message: 'order created', id: 1});
    } else {
        res.status(415).json({status: 'error', message: 'media type not supported'});
    }
});

//Add a wildcard route to ensure that a JSON response is sent in other cases.
app.use('*', function (req, res) {
    res.status(400).json({status: 'error', message: 'request not understood'});
});

//error route
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message
    });
});

//This function starts the server.
function startServer() {
    app.listen(app.get('port'), function () {
        util.log('Sever started on %s mode in port %d ...', app.get('env'), app.get('port'));
    })
};

//If file is run directly, start the server. Otherwise, export the application (express) object.
if (require.main === module) {
    startServer();
} else {
    module.exports = startServer;
}