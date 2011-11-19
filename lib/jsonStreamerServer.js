var net = require('net');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var jsonStreamerUtils = require('./jsonStreamerUtils');

function Server() {
  var self = this;
  EventEmitter.call(self);
  net.Server.call(self);

  self.on('connection', function connection(client) {
    client.setEncoding('utf8');
    client.writeJSON = jsonStreamerUtils.writeJSON(client);
    var buffer = '';

    function parseMessages() {
      var result = jsonStreamerUtils.parseMessages(buffer);
      buffer = result.remainingBuffer;
      result.messages.forEach(function handleMessage(msg) {
        self.emit('msg', { content: msg, client: client });
      });
    }

    client.on('data', function data(data) {
      buffer += data;
      parseMessages();
    });

    client.on('end', function end() {
      // Try to parse any remaining data in the buffer
      parseMessages();
      if (buffer.length > 0) {
        console.log('Dodgy or incomplete data remaining on end %s', buffer);
      }
    });

    setInterval(function checkBuffer() {
      if (!jsonStreamerUtils.isBufferHappy(buffer)) {
        parseMessages();
        if (!jsonStreamerUtils.isBufferHappy(buffer)) {
          buffer = '';
          console.log('Purged oversized (512kb) buffer.');
          client.writeJSON({ error: 'Purged oversized (512kb) buffer.' });
        }
      }
    }, 1000);

  });
}
util.inherits(Server, EventEmitter);
util.inherits(Server, net.Server);

exports.Server = Server;
