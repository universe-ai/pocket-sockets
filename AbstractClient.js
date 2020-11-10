/**
 * Boilerplate for creating and wrapping a socket (TCP, Websocket or Virtual) under a common interface.
 *
 * Socket specific functions need to be overridden/implemented.
 *
 */
class AbstractClient
{
    /**
     * @param {Object} connectOptions required if socket is not set.
     *  {
     *      host: <string | null>, RFC6066 states that this should not be an IP address, but a name when using TLS)
     *      port: <number>,
     *      secure: <boolean | null> (defualt false, set to true to make a secure connection)
     *      rejectUnauthorized: <boolean | null> (default true),
     *      cert: <Array | string | Buffer | null>, (client can identify with cert)
     *      key: <Array | string | Buffer | null>, (required if cert is set)
     *      ca: <Array | string | Buffer | null>, (set this to validate server self-signed certificate)
     *  }
     *
     * @param {Socket} [socket] Optionally provide an already connected socket (typically for server client sockets). connectOptions can then be set to null.
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
     */
    onError(fn)
    {
        this._on("error", fn);
    }

    /**
     * Unhook for socket errors.
     */
    offError(fn)
    {
        this._off("error", fn);
    }

    /**
     * User hook for incoming data.
     * Callback function is passed a Buffer object.
     */
    onData(fn)
    {
        this._on("data", fn);
    }

    /**
     * Unhook for socket data.
     */
    offData(fn)
    {
        this._off("data", fn);
    }

    /**
     * User hook for connection event.
     */
    onConnect(fn)
    {
        this._on("connect", fn);
    }

    /**
     * Unhook connection event.
     */
    offConnect(fn)
    {
        this._off("connect", fn);
    }

    /**
     * User hook for disconnect event.
     */
    onDisconnect(fn)
    {
        this._on("disconnect", fn);
    }

    /**
     * Unhook disconnect event
     */
    offDisconnect(fn)
    {
        this._off("disconnect", fn);
    }

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

    _error(msg)
    {
        this._triggerEvent("error", msg);
    }

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
