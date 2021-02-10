/**
 * Boilerplate for creating and wrapping a server socket listener (TCP or Websocket) under a common interface.
 *
 * Socket specific functions need to be overridden/implemented.
 *
 */
class AbstractServer
{
    /**
     * @param {Object} listenOptions
     *  {
     *      host: <string | null>
     *      port: <number>
     *      ipv6Only: <boolean | null>
     *      rejectUnauthorized: <boolean | null> (generally set to true by implementations. Only applicable for secure connections)
     *      requestCert: <boolean | null> (default false)
     *      cert: <Array | string | Buffer | null> (if set the socket becomes secure)
     *      key: <Array | string | Buffer | null> (required if cert is set)
     *      ca: <Array | string | Buffer | null> (set this to validate client self-signed certificate)
     *  }
     *
     *  A listener automatically becomes secure if cert/key are set.
     * @throws An error will be thrown when listenOptions is invalid.
     */
    constructor(listenOptions)
    {
        AbstractServer.ValidateConfig(listenOptions);
        this.listenOptions  = listenOptions;
        this.SocketType     = null;  // Must be set in derived class.
        this.server         = null;
        this.eventHandlers  = {};
        this.clients        = [];

        this.isDisconnected     = false;

        /** A client has been accepted */
        this._connection        = this._connection.bind(this);

        /** Some server error */
        this._error             = this._error.bind(this);

        /** Server and all it's connections have finally closed */
        this._close             = this._close.bind(this);

        this._serverCreate();
    }

    /**
     * Create the server socket.
     */
    _serverCreate()
    {
        throw "Not implemented.";
    }

    /**
     * Initiate the server listener.
     */
    _serverListen()
    {
        throw "Not implemented.";
    }

    /**
     * Close the server.
     * Override if necessary.
     */
    _serverClose()
    {
        this.server.close();
    }

    /**
     * Listens for connections and yields connected client sockets.
     *
     */
    listen()
    {
        this._serverListen();
    }

    /**
     * Close listener and all accepted socket clients.
     */
    close()
    {
        if (!this.server) {
            return;
        }
        this._serverClose();
        this.clients.forEach( client => client.disconnect() );
        this.clients = [];
    }

    /**
     * Event handler triggered when client has connected.
     *
     * A Client object is passed as argument to fn() of the instance type this.SocketType.
     *
     * @param {Function} fn callback
     */
    onConnection(fn)
    {
        this._on("connection", fn);
    }

    /**
     * Event handler triggered when a server error occurs.
     *
     * An error object is passed as argument to fn().
     *
     * @param {Function} fn callback
     */
    onError(fn)
    {
        this._on("error", fn);
    }

    /**
     * Event handler triggered when server has closed together with all its client sockets.
     *
     * @param {Function} fn callback
     */
    onClose(fn)
    {
        this._on("close", fn);
    }

    /**
     * Performs all operations involved in registering a new client connection.
     *
     * @param {AbstractClient} client
     */
    _addClient(client)
    {
        this.clients.push(client);
        client.onDisconnect( () => { this._removeClient(client) } );
        this._triggerEvent("connection", client);
    }

    /**
     * Performs all operations involved in removing an existing client registration.
     *
     * @param {AbstractClient} client
     */
    _removeClient(client)
    {
        const index = this.clients.indexOf(client);
        if (index > -1) {
            this.clients.splice(index, 1)
        }
    }

    /**
     * Internal procedure to serve all client connection events.
     *
     * @param {Socket} socket
     * @throws An error will be thrown when SocketType is invalid or not set.
     */
    _connection(socket)
    {
        if (!this.SocketType) {
            throw "SocketType must be a valid instance";
        } else {
            const client = new this.SocketType(null, socket);
            this._addClient(client);
        }
    }

    /**
     * Internal error event implementation.
     *
     * @param {Error} err
     */
    _error(err)
    {
        this._triggerEvent("error", (err && err.message) ? err.message : err);
    }

    /**
     * Internal close event implementation.
     */
    _close()
    {
        this._triggerEvent("close");
    }

    /**
     * Internal event implementation.
     *
     * @param {string} event
     * @param {Function} fn
     */
    _on(event, fn)
    {
        const fns = this.eventHandlers[event] || [];
        this.eventHandlers[event] = fns;
        fns.push(fn);
    }

    /**
     * Internal event trigger implementation.
     *
     * @param {string} event
     * @param {any} data
     */
    _triggerEvent(event, data)
    {
        const fns = this.eventHandlers[event] || [];
        fns.forEach( fn => {
            fn(data);
        });
    }

    /**
     * @param {Object} options
     *  {
     *      host: <string | null> (RFC6066 states that this should not be an IP address, but a name when using TLS)
     *      port: <number>
     *      ipv6Only: <boolean | null> (commonly set to false by implementations. Enable to use IPv6 only)
     *      rejectUnauthorized: <boolean | null> (generally set to true by implementations. Only applicable for secure connections)
     *      cert: <string | Buffer | null> (client can identify with cert)
     *      key: <string | Buffer | null> (required if cert is set)
     *      ca: <string | Buffer | null> (set this to validate server self-signed certificate)
     *  }
     *
     * @throws An error will be thrown when options is not a valid configuration.
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
        if (options.ipv6Only && typeof options.ipv6Only !== "boolean") {
            throw "ipv6Only must be null or boolean";
        }
        if (options.rejectUnauthorized && typeof options.rejectUnauthorized !== "boolean") {
            throw "rejectUnauthorized must be null or boolean";
        }
        if (options.requestCert && typeof options.requestCert !== "boolean") {
            throw "requestCert must be null or boolean";
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

module.exports = AbstractServer;
