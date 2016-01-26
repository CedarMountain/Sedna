/**
 * Created by Greg Woodhouse on 11/05/15.
 * Test Endpoint (version 0.0.3)
 *
 * This version is written in direct style and is structured as a "big if". In future
 * versions, the code will be more easily configurable.
 */

var util = require('util');
var http = require('http');

//a utility function used to return various responses
function simpleResponse(res, code, text) {
    res.writeHead(code, {'Content-type': 'text/plain'});
    res.end(text);
}

//process plain text
function handleText(req, res) {
    var data = '';
    req.on('readable', function () {
        data += req.read();
    });
    req.on('end', function () {
        util.log('Received: %s', data);
        simpleResponse(res, 200, util.format('Received plain text: %s\n', data));
    });
}

//process JSON
function handleJSON(req, res) {
    var data = '';
    var parsed_data = null;
    req.on('readable', function () {
        data += req.read();
    });
    req.on('end', function () {
        util.log('Received: %s', data);
        try {
            parsed_data = JSON.parse(data);
            simpleResponse(res, 200, 'request received');
        }
        catch (e) {
            util.log('Parse error: %s', e.toString());
            simpleResponse(res, 400, e.toString());
        }
    });
}

//All requests are handled here.
function handleRequest(req, res) {
    var url = req.url;
    var method = req.method;
    util.log('%s %s', method, url);

    if (method == 'GET') {
        simpleResponse(res, 200, 'Your request was received and acted upon. Cool!');
    }
    else if (method == 'HEAD') {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end();
    }
    else if (method == 'POST') {
        var mtype = req.headers['content-type'];
        util.log('Content type is %s', mtype);
        if (mtype == 'text/plain') {
            //simpleResponse(res, 200, 'received plain text (POST)');
            handleText(req, res);
        }
        else if (mtype == 'application/json') {
            handleJSON(req, res);
        }
        else if (mtype == 'application/x-www-form-urlencoded') {
            simpleResponse(res, 200, 'Received form data (POST)');
        }
        else {
            simpleResponse(res, 415, 'Unsupported media type');
        }
    }
    else if (method == 'PUT') {
        var mtype = req.headers['content-type'];
        util.log('Content type is %s', mtype);
        if (mtype == 'text/plain') {
            simpleResponse(res, 201, 'received plain text (PUT)');
        }
        else if (mtype = 'application/x-www-form-urlencoded') {
            simpleResponse(res, 201, 'received form data (PUT)');
        }
        else if (mtype == 'application/json') {
            handleJSON(req, res);
        }
        else {
            simpleResponse(res, 415, 'Unsupported media type');
        }
    }
    else if (method == 'DELETE') {
        res.writeHead(204);
        res.end();
    }
    else {
        simpleResponse(res, 500, 'Request not understood')
    }
}

//start the server
http.createServer(handleRequest).listen(8080);
util.log('Server started on port 8080');

//Unit tests
function test1(tag) {
    util.log('%s - simple GET', tag);
    var req=http.get('http://127.0.0.1:8080/abc/', function (res) {
        res.on('data', function (chunk) {
            util.log('%s - client received: %s',tag,  chunk);
        });
        util.log('%s - status code: %d', tag, res.statusCode);
    });
    req.on('error', function (e) {
        util.log('Got error: ' + e.message());
    });
}

function test2(tag) {
    util.log('%s - POST plain text', tag);
    var data = 'Hello, world!';
    var options = {
        hostname: '127.0.0.1', //default
        port: 8080,
        path: '/upload',
        method: 'POST',
        headers: {
            'Content-type': 'text/plain',
            'Content-length': data.length
        }
    };
    var req = http.request(options, function (res) {
        util.log('%s - status code: %d', tag, res.statusCode);
        res.on('data', function (chunk) {
            util.log('%s - client received: %s',tag,  chunk);
        });
    });
    req.on('error', function (e) {
        util.log('%s - error performing request: %s', tag, e.message);
    });
    req.write(data);
    req.end();
}

function test3(tag) {
    util.log('%s - POST plain text (multiple chunks)', tag);
    var options = {
        hostname: '127.0.0.1', //default
        port: 8080,
        path: '/upload',
        method: 'POST',
        headers: {
            'Content-type': 'text/plain'
        }
    };
    var req = http.request(options, function (res) {
        util.log('%s - status code: %d', tag, res.statusCode);
        res.on('data', function (chunk) {
            util.log('%s - client received: %s',tag,  chunk);
        });
    });
    req.on('error', function (e) {
        util.log('%s - error performing request: %s', tag, e.message);
    });
    req.write('This is some text. ');
    req.write('This is some more ');
    req.write('text.\n');
    req.end();
}

function test4(tag) {
    util.log('%s - POST (JSON format)', tag)
    var data = '{"first":"John","last":"Doe"}';
    var options = {
        hostname: '127.0.0.1', //default
        port: 8080,
        path: '/person',
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        }
    };
    var req = http.request(options, function (res) {
        util.log('%s - status code: %d', tag, res.statusCode);
        res.on('data', function (chunk) {
            util.log('%s - client received: %s',tag,  chunk);
        });
    });
    req.on('error', function (e) {
        util.log('%s - error performing request: %s', tag, e.message);
    });
    req.write(data);
    req.end();
}

function test5(tag) {
    util.log('%s - POST (bad JSON)', tag)
    var data = '{"first":"John",last:"Doe"}';
    var options = {
        hostname: '127.0.0.1', //default
        port: 8080,
        path: '/person',
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        }
    };
    var req = http.request(options, function (res) {
        util.log('%s - status code: %d', tag, res.statusCode);
        res.on('data', function (chunk) {
            util.log('%s - client received: %s',tag,  chunk);
        });
    });
    req.on('error', function (e) {
        util.log('%s - error performing request: %s', tag, e.message);
    });
    req.write(data);
    req.end();
}
//Run the tests
test1('Test 1');
test2('Test 2');
test3('Test 3');
test4('Test 4');
test5('Test 5');
