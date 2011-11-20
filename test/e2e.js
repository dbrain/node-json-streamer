var Server = require('../lib/jsonStreamerServer').Server;
var Client = require('../lib/jsonStreamerClient').Client;
var jsonStreamer = require('../lib/jsonStreamer');

var server = jsonStreamer.listen(3001);

server.on('connection', function (client) {
  client.on('msg', function gotMsg(msg) {
    console.log('Server received message: ', msg.content);
    client.writeJSON({ ok: true });
  })
});

var client = jsonStreamer.connect(3001, function connectListener() {
  console.log("Connected");
  client.writeJSON({ a: 'b', c: 'd'});
  client.writeJSON(JSON.stringify({ b: 'b', d: 'd'}));
  client.writeJSON("BAHABABAHBAHABHA" + JSON.stringify({a: 'ok'}));
  client.writeJSON("OH GOD WHY");
  client.writeJSON('{"a":"b"}');
  client.writeJSON('{"a":');
  client.writeJSON('"b"}');
});

client.on('msg', function gotMsg(msg) {
  console.log('Client received message: ', msg.content);
});
