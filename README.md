# pocket-sockets

A powerful and smooth sockets library for browser and _Node.js_, supporting both _WebSockets_ and regular _TCP_ sockets, encrypted or not.

This project is extracted as a standalone project from the [Universe-ai/core-js](https://github.com/universe-ai/core-js) project and can be used on its own.

## WebSockets vs. regular TCP sockets
_WebSockets_ are great when using a browser, however plain _TCP_ sockets are faster and a good choice if no one of the peers is a browser.

The overall interface for _pocket-sockets_ _WebSocket_ and _TCP_ sockets are the same so it is easy to switch between the underlying implementations.

## License
This project is released under the _MIT_ license. Refer to the [LICENSE](https://github.com/universe-ai/core-js/blob/master/LICENSE) file for details.
