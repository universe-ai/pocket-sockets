const net = require("net");
const tls = require("tls");

const AbstractClient = require("./AbstractClient.js");

/**
 * TCP client socket implementation.
 */
class TCPClient extends AbstractClient
{

    /**
     * Specifies how the socket gets initialized and created, then establishes a connection.
     */
    _socketConnect()
    {
        const USE_TLS = this.connectOptions.secure ? true: false;

        if(USE_TLS) {
            const tlsOptions = {
                host: this.connectOptions.host,
                port: this.connectOptions.port,

                // Client certificate, must be set when using TLS if the server requires it.
                cert: this.connectOptions.cert,
                key: this.connectOptions.key,

                // Enforce server connection verification.
                // If this is set to true, then any requested certificate will be validated.
                rejectUnauthorized: this.connectOptions.rejectUnauthorized,

                // If validating the server cert (rejectUnauthorized == true)
                // then we can set the CA cert here which can make a self signed client cert valid in our context.
                ca: this.connectOptions.ca
            };
            this.socket = tls.connect(tlsOptions);
            this.socket.on("secureConnect", this._connect);
        }
        else {
            this.socket = net.connect({
                host: this.connectOptions.host,
                port: this.connectOptions.port,
            });
            this.socket.on("connect", this._connect);
        }
    }

    /**
     * Specifies hooks to be called as part of the connect procedure.
     */
    _socketHook()
    {
        this.socket.on("data", this._data);             // Incoming data
        this.socket.on("error", this._error);           // Error connecting
        this.socket.on("close", this._disconnect);      // Socket closed
    }

    /**
     * Defines how data gets written to the socket.
     * @param {Buffer} buffer - data to be sent
     */
    _socketSend(buffer)
    {
        this.socket.write(buffer);
    }

    /**
     * Defines the steps to be performed during disconnect.
     */
    _socketDisconnect()
    {
        this.socket.end();
    }
}

module.exports = TCPClient;
