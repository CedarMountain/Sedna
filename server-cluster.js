/**
 * Created by Greg Woodhouse on 12/7/15.
 */
var cluster = require('cluster');
var util = require('util');
var juniper = require('./server.js');

function startWorker() {
    var worker = cluster.fork();
    util.log('cluster: worker %d started', worker.id);
}

if (cluster.isMaster) {
    require('os').cpus().forEach(function () {
        startWorker();
    });

    //log disconnects, we'll start new workers when the old one exits
    cluster.on('disconnect', function (worker) {
        util.log('cluster: worker %d disconnected from the cluster', worker.id);
    });

    //log exits and start new worker
    cluster.on('exit', function (worker, code, signal) {
        util.log('cluster: worker %d died with exit code %d (%s)', worker.id, code, signal);
        startWorker();
    });

} else {
    juniper(); //start server in worker thread
}