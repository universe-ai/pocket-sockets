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

class WSClient extends AbstractClient
{
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
        } else {
            this.socket = new ws(address, {
                // Server certificate, must be set when using TLS.
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

    _socketHook()
    {
        this.socket.onmessage   = (msg) => this._data(msg.data);          // Incoming data
        this.socket.onerror     = this._error;           // Error connecting
        this.socket.onclose     = this._disconnect;      // Socket closed
    }

    _socketSend(buffer)
    {
        this.socket.send(buffer, {binary: true, compress: false});
    }

    _socketDisconnect()
    {
        this.socket.close();
    }
}

module.exports = WSClient;
