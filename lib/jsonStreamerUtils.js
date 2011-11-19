var endSequences = [ "}\u2603", "]\u2603" ];

function parseMessage(message) {
  var result;
  try {
    result = JSON.parse(message);
  } catch (e) {
    // no-op,
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
  return function writeJSONToSocket(json) {
    var string;
    if (typeof(json) === 'string') {
      string = json;
    } else {
      string = JSON.stringify(json);
    }
    socket.write(string + '\u2603');
  };
}

function isBufferHappy(buffer) {
  return (!buffer || buffer.length < 512000);
}

exports.parseMessages = parseMessages;
exports.writeJSON = writeJSON;
exports.isBufferHappy = isBufferHappy;
