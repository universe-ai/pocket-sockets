# pocket-sockets

A powerful and smooth sockets library for browser and nodejs, supporting both websockets and regular TCP sockets, encrypted or not.

This project is extracted as a standalone project from the Universe-ai/core-js project and can be used on its own.

## WebSockets vs. regular TCP sockets
WebSockets are great when using a browser, however plain TCP sockets are faster and a good choice if no one of the peers is a browser.

The overall interface for pocket-sockets WebSocket and TCP sockets are the same so it is easy to switch between the underlaying implementations.

## License
This project is released under the MIT license.
