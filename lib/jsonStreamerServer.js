var net = require('net');
var util = require('util');
var jsonStreamerUtils = require('./jsonStreamerUtils');

function Server() {
  net.Server.call(this);

  this.on('connection', function connection(client) {
    jsonStreamerUtils.addStreamingToSocket(client);
  });
}
util.inherits(Server, net.Server);

exports.Server = Server;
