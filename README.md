# node-json-streamer
A really basic library wrapping a node TCP socket sending and parsing multiple JSON objects.
All this does is add an escape character on the client side (\u2603: A unicode snowman), split up the messages received on ]\u2603 || }\u2603, then emit 'object' with the parsed JSON or 'objectError' if an object failed parsing.
It does some error checking so if you send fluff down the socket then proper JSON it'll trim the fluff (without any kind of notification at all).

## Installation
npm link path/to/json-streamer

## Requirements


## Features


## Usage


