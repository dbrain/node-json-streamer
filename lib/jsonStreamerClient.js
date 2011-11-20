var net = require('net');
var util = require('util');
var jsonStreamerUtils = require('./jsonStreamerUtils');

function Client(options) {
  net.Socket.call(this);
  jsonStreamerUtils.addStreamingToSocket(this);
}
util.inherits(Client, net.Socket);

exports.Client = Client;
