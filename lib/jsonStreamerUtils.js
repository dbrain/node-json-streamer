var endChar = '\u00a0';
var endSequences = [ '}' + endChar, ']' + endChar ];

function parseMessage(message) {
  var result;
  try {
    result = JSON.parse(message);
  } catch (e) {
    // no-op, just want to see if it's parseable.
  }
  return result;
}

function earliestIndexOf(string, searchItems) {
  var firstResult = -1;
  searchItems.forEach(function checkItem(searchItem) {
    var foundIndex = string.indexOf(searchItem);
    if (foundIndex !== -1 && (firstResult === -1 || firstResult > foundIndex)) {
      firstResult = foundIndex;
    }
  });
  return firstResult;
}

function sanitizeMessage(message) {
  var result = parseMessage(message);
  if (!result) {
    console.log('Could not parse message, %s, trying to sanitize', message);
    var firstStartSeq = earliestIndexOf(message, ['[', '{']);
    if (firstStartSeq === -1) {
      console.log('Dropping bad message: ', message);
    } else {
      result = parseMessage(message.slice(firstStartSeq, message.length));
      if (!result) {
        console.log('Dropping bad message: ' + message);
      }
    }
  }
  return result;
}

function parseMessages(buffer) {
  var result = { remainingBuffer: buffer, messages: [] };
  var firstEndSeq = earliestIndexOf(buffer, endSequences);
  if (firstEndSeq !== -1) {
    var message = buffer.slice(0, ++firstEndSeq);
    buffer = buffer.slice(++firstEndSeq, buffer.length);
    var parsedMessage = sanitizeMessage(message);
    if (parsedMessage) {
      result.messages.push(parsedMessage);
    }
    if (buffer) {
      var deepResult = parseMessages(buffer);
      buffer = deepResult.remainingBuffer;
      result.messages = result.messages.concat(deepResult.messages);
    }
  }
  result.remainingBuffer = buffer;
  return result;
}

function writeJSON(socket) {
  return function writeJSONToSocket(json, cb) {
    var string;
    if (typeof(json) === 'string') {
      string = json;
    } else {
      string = JSON.stringify(json);
    }
    socket.write(string + endChar, cb);
  };
}

function isBufferHappy(buffer) {
  return (!buffer || buffer.length < 512000);
}

function addStreamingToSocket(socket) {
  var buffer = '';
  socket.setEncoding('utf8');
  socket.writeJSON = writeJSON(socket);

  function readMessages() {
    var result = parseMessages(buffer);
    buffer = result.remainingBuffer;
    result.messages.forEach(function handleMessage(msg) {
      socket.emit('msg', { content: msg });
    });
  }

  socket.on('data', function data(data) {
    buffer += data;
    readMessages();
  });

  socket.on('end', function end() {
    // Try to parse any remaining data in the buffer
    readMessages();
    if (buffer.length > 0) {
      console.log('Dodgy or incomplete data remaining on end %s', buffer);
    }
  });

  setInterval(function checkBuffer() {
    if (!isBufferHappy(buffer)) {
      readMessages();
      if (!isBufferHappy(buffer)) {
        buffer = '';
        console.log('Purged oversized (512kb) buffer.');
      }
    }
  }, 1000);
}

exports.parseMessages = parseMessages;
exports.writeJSON = writeJSON;
exports.isBufferHappy = isBufferHappy;
exports.addStreamingToSocket = addStreamingToSocket;
