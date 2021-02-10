/**
 * Boilerplate for creating and wrapping a socket (TCP, Websocket or Virtual) under a common interface.
 *
 * Socket specific functions need to be overridden/implemented.
 *
 */
class AbstractClient
{
    /**
     * @param {Object | null} connectOptions required if socket is not set.
     *  {
     *      host: <string | null>, (RFC6066 states that this should not be an IP address, but a name when using TLS)
     *      port: <number>,
     *      secure: <boolean | null> (default false, set to true to make a secure connection)
     *      rejectUnauthorized: <boolean | null> (default true),
     *      cert: <string | Buffer | null>, (client can identify with cert)
     *      key: <string | Buffer | null>, (required if cert is set)
     *      ca: <string | Buffer | null>, (set this to validate server self-signed certificate)
     *  }
     *
     * @param {Socket} [socket] Optionally provide an already connected socket (typically for server client sockets). connectOptions can then be set to null.
     * @throws An error will be thrown when connectOptions is not valid.
     */
    constructor(connectOptions, socket)
    {
        if (!socket) {
            AbstractClient.ValidateConfig(connectOptions);
        }

        this.connectOptions = connectOptions;
        this.socket         = socket || null;
        this.eventHandlers  = {};
        this.isDisconnected = false;
        this.bufferData     = true;  // Buffer data when no one is listening for data events.
        this._connect       = this._connect.bind(this);
        this._data          = this._data.bind(this);
        this._error         = this._error.bind(this);
        this._disconnect    = this._disconnect.bind(this);
        this.userData       = {};  // Arbitrary data associated with socket

        if (this.socket) {
            this._socketHook();
        }
    }

    /**
     * Connect to server.
     *
     */
    connect()
    {
        if (this.socket) {
            throw "Reconnect not allowed.";
        }

        this._socketConnect();
        this._socketHook();
    }

    /**
     * Create the socket object and initiate a connection.
     * This only done for initiating client sockets.
     * A server listener socket client is already connected and must be passed in the constructor.
     */
    _socketConnect()
    {
        throw "Function not implemented.";
    }

    /**
     * Hook events on the socket.
     */
    _socketHook()
    {
        throw "Function not implemented.";
    }

    /**
     * Send the given buffer on socket.
     * Socket specific implementation.
     */
    _socketSend(buffer)
    {
        throw "Function not implemented.";
    }

    _socketDisconnect()
    {
        throw "Function not implemented.";
    }

    /**
     * Send buffer on socket.
     *
     * @param {Buffer | string} buffer - data to be sent
     * @throws An error will be thrown when buffer data type is incompatible.
     *  An error will be thrown when no socket connection is available.
     *  An error will be thrown when connection is flagged as disconnected.
     */
    send(buffer)
    {
        if ( !(buffer instanceof Buffer)) {
            if ( typeof buffer !== "string" ) {
                throw "Data must be of Buffer or string type.";
            }
            buffer = Buffer.from(buffer);
        }

        if (!this.socket) {
            throw "Not connected";
        }

        if (this.isDisconnected) {
            throw "Socket is closed, cannot send.";
        }

        this._socketSend(buffer);
    }

    /**
     * Disconnect socket.
     */
    disconnect()
    {
        if (this.isDisconnected) {
            return;
        }

        if (!this.socket) {
            return;
        }

        this._socketDisconnect();
    }

    /**
     * User hook for socket errors.
     *
     * @param {Function} fn - on error callback
     *
     */
    onError(fn)
    {
        this._on("error", fn);
    }

    /**
     * Unhook for socket errors.
     *
     * @param {Function} fn - remove existing error callback
     *
     */
    offError(fn)
    {
        this._off("error", fn);
    }

    /**
     * User hook for incoming data.
     *
     * @param {Function} fn - on data callback. Function is passed a Buffer object.
     */
    onData(fn)
    {
        this._on("data", fn);
    }

    /**
     * Unhook for socket data.
     *
     * @param {Function} fn - remove data callback.
     *
     */
    offData(fn)
    {
        this._off("data", fn);
    }

    /**
     * User hook for connection event.
     *
     * @param {Function} fn - on connect callback.
     *
     */
    onConnect(fn)
    {
        this._on("connect", fn);
    }

    /**
     * Unhook connection event.
     *
     * @param {Function} fn - remove connect callback.
     *
     */
    offConnect(fn)
    {
        this._off("connect", fn);
    }

    /**
     * User hook for disconnect event.
     *
     * @param {Function} fn - on disconnect callback.
     *
     */
    onDisconnect(fn)
    {
        this._on("disconnect", fn);
    }

    /**
     * Unhook disconnect event
     *
     * @param {Function} fn - remove disconnect callback.
     *
     */
    offDisconnect(fn)
    {
        this._off("disconnect", fn);
    }

    /**
     * Base on event procedure responsible for adding a callback to the list of event handlers.
     *
     * @param {string} event - event name.
     * @param {Function} fn - callback.
     *
     */
    _on(event, fn)
    {
        const tuple = (this.eventHandlers[event] || [[], []]);
        this.eventHandlers[event] = tuple;
        const [fns, queue] = tuple;
        if (fns.length === 0) {
            // Send buffered up events.
            queue.forEach( event => {
                fn(event);
            });
            queue.length = 0;
        }
        fns.push(fn);
    }

    /**
     * Base off event procedure responsible for removing a callback from the list of event handlers.
     *
     * @param {string} event - event name.
     * @param {Function} fn - callback.
     *
     */
    _off(event, fn)
    {
        const [fns, queue] = (this.eventHandlers[event] || [[], []]);
        const index = fns.indexOf(fn);
        if (index > -1) {
            fns.splice(index, 1);
        }
    }

    _disconnect()
    {
        this.isDisconnected = true;
        this._triggerEvent("disconnect", this);
    }

    /**
     * Base data event procedure responsible for triggering the data event.
     *
     * @param {Buffer} data - data buffer.
     *
     */
    _data(data)
    {
        if ( !(data instanceof Buffer)) {
            throw "Must read buffer.";
        }

        this._triggerEvent("data", data, this.bufferData);
    }

    _connect()
    {
        this._triggerEvent("connect");
    }


    /**
     * Base error event procedure responsible for triggering the error event.
     *
     * @param {string} msg - error message.
     *
     */
    _error(msg)
    {
        this._triggerEvent("error", msg);
    }

    /**
     * Trigger event calls the appropriate handler based on the event name.
     *
     * @param {string} event - event name.
     * @param {Buffer} [data] - event data.
     * @param {boolean} [doBuffer] - buffers up event data.
     *
     */
    _triggerEvent(event, data, doBuffer)
    {
        const [fns, queue] = (this.eventHandlers[event] || [[], []]);
        if (fns.length === 0) {
            if (doBuffer) {
                // Buffer up the event
                queue.push(data);
            }
        }
        else {
            fns.forEach( fn => {
                fn(data);
            });
        }
    }

    /**
     * @param {Object} options
     *  {
     *      host: <string | null>, (RFC6066 states that this should not be an IP address, but a name when using TLS)
     *      port: <number>,
     *      secure: <boolean | null> (default false, set to true to make a secure connection)
     *      rejectUnauthorized: <boolean | null> (default true),
     *      cert: <string | Buffer | null>, (client can identify with cert)
     *      key: <string | Buffer | null>, (required if cert is set)
     *      ca: <string | Buffer | null>, (set this to validate server self-signed certificate)
     *  }
     *
     * @throws An error will be thrown when connectOptions is not a valid configuration.
     */
    static ValidateConfig(options)
    {
        if (!options) {
            throw "Bad options";
        }
        if (options.host && typeof options.host !== "string") {
            throw "host must be null or string";
        }
        if (typeof options.port !== "number") {
            throw "port must be a number";
        }
        if (options.secure && typeof options.secure !== "boolean") {
            throw "secure must be null or boolean";
        }
        if (options.rejectUnauthorized && typeof options.rejectUnauthorized !== "boolean") {
            throw "rejectUnauthorized must be null or boolean";
        }
        if (options.cert && 
            (typeof options.cert !== "string" && !(options.cert instanceof Buffer) )) {
            throw "cert must be null, string or Buffer";
        }
        if (options.key && 
            (typeof options.key !== "string" && !(options.key instanceof Buffer) )) {
            throw "key must be null, string or Buffer";
        }
        if (options.ca && 
            (typeof options.ca !== "string" && !(options.ca instanceof Buffer) )) {
            throw "ca must be null, string or Buffer";
        }
    }
}

module.exports = AbstractClient;
