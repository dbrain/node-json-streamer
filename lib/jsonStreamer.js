var Client = require('./jsonStreamerClient').Client;
var Server = require('./jsonStreamerServer').Server;

function connect() {
  var client = new Client();
  client.connect.apply(client, arguments);
  return client;
}

function listen() {
  var server = new Server();
  server.listen.apply(server, arguments);
  return server;
}

exports.connect = connect;
exports.listen = listen;
exports.Server = Server;
exports.Client = Client;
