var net = require('net');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var jsonStreamerUtils = require('./jsonStreamerUtils');

function Client(options) {
  var self = this;
  EventEmitter.call(self);
  net.Socket.call(self);

  var buffer = '';
  self.setEncoding('utf8');
  self.writeJSON = jsonStreamerUtils.writeJSON(self);

  function parseMessages() {
    var result = jsonStreamerUtils.parseMessages(buffer);
    buffer = result.remainingBuffer;
    result.messages.forEach(function handleMessage(msg) {
      self.emit('msg', { content: msg });
    });
  }

  self.on('data', function data(data) {
    buffer += data;
    parseMessages();
  });

  self.on('end', function end() {
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
      }
    }
  }, 1000);

}
util.inherits(Client, EventEmitter);
util.inherits(Client, net.Socket);

exports.Client = Client;
