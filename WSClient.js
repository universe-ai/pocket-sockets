// Add browser/browserify/parcel dependency
if(typeof "process" === "undefined" && !process && !process.versions && !process.versions.node) {
    require("regenerator-runtime/runtime");
}

let isBrowser;
let ws = null;
if (typeof WebSocket !== "undefined") {
    isBrowser = true;
    ws = WebSocket;
} else if (typeof MozWebSocket !== "undefined") {
    isBrowser = true;
    ws = MozWebSocket;
} else if (typeof window !== "undefined") {
    isBrowser = true;
    ws = window.WebSocket || window.MozWebSocket;
} else {
    isBrowser = false;
    ws = require("ws");
}

const AbstractClient = require("./AbstractClient.js");

/**
 * WebSocket client implementation.
 */
class WSClient extends AbstractClient
{
    /**
     * Specifies how the socket gets initialized and created, then establishes a connection.
     */
    _socketConnect()
    {
        const USE_TLS = this.connectOptions.secure ? true: false;

        let address;
        if(USE_TLS) {
            address = `wss://${this.connectOptions.host}:${this.connectOptions.port}`;
        }
        else {
            address = `ws://${this.connectOptions.host}:${this.connectOptions.port}`;
        }

        if(isBrowser) {
            this.socket = new ws(address);
            // Make sure binary type is set to ArrayBuffer instead of Blob
            this.socket.binaryType = "arraybuffer";
        } else {
            this.socket = new ws(address, {
                // Client certificate, can be set when using TLS, could be required by the server.
                cert: this.connectOptions.cert,
                key: this.connectOptions.key,

                // Certs are always fetched from the server,
                // If set to true we do not allow server self signed certs.
                rejectUnauthorized: this.connectOptions.rejectUnauthorized,

                // If validating the server cert (rejectUnauthorized == true)
                // then we can set the CA cert here which can make a self signed server cert
                // valid in our context.
                ca: this.connectOptions.ca,

                perMessageDeflate: false,
                maxPayload: 100 * 1024 * 1024,
            });
        }

        this.socket.onopen      = this._connect;
    }

    /**
     * Specifies hooks to be called as part of the connect procedure.
     */
    _socketHook()
    {
        this.socket.onmessage   = (msg) => {
            let data = msg.data;

            // Under Browser settings, convert message data from ArrayBuffer to Buffer.
            if (isBrowser) {
                const bytes = new Uint8Array(data);
                data = Buffer.from(bytes);
            }

            this._data(data);          // Incoming data
        };
        this.socket.onerror     = this._error;           // Error connecting
        this.socket.onclose     = this._disconnect;      // Socket closed
    }

    /**
     * Defines how data gets written to the socket.
     * @param {Buffer} buffer - data to be sent
     */
    _socketSend(buffer)
    {
        this.socket.send(buffer, {binary: true, compress: false});
    }

    /**
     * Defines the steps to be performed during disconnect.
     */
    _socketDisconnect()
    {
        this.socket.close();
    }
}

module.exports = WSClient;
