const WebSocket = require("ws");
const WSClient = require("./WSClient");

const AbstractServer = require("./AbstractServer");

class WSServer extends AbstractServer
{
    constructor(listenOptions)
    {
        super(listenOptions);
        this.wsServer = null;
        this.SocketType = WSClient;
    }

    _serverCreate()
    {
        const USE_TLS = this.listenOptions.cert != null;

        if(USE_TLS) {
            const tlsOptions = {
                // Server certificate, must be set when using TLS.
                cert: this.listenOptions.cert,
                key: this.listenOptions.key,

                // Enforce client-side certification.
                // If this is set the server will request a client certificate.
                requestCert: this.listenOptions.requestCert,

                // Enforce client connection verification.
                // If this is set to true, then any requested certificate will be validated if requestCert is set.
                rejectUnauthorized: this.listenOptions.rejectUnauthorized,

                // If requesting and validating the client cert (requestCert == true, rejectUnauthorized == true)
                // then we can set the CA cert here which can make a self signed client cert valid in our context.
                ca: this.listenOptions.ca,

                // Milliseconds until we timeout a TLS-handshake.
                // This is important to have when a regular TCP socket is connecting to a TLS socket,
                // and the client is waiting for the server to send first message, then no handshake error will happen because no data is transmitted.
                handshakeTimeout: 30000,
            };
            const https = require("https");
            this.server = https.createServer(tlsOptions);
        }
        else {
            const http = require("http");
            this.server = http.createServer();
        }

        this.server.on("tlsClientError", this._error);
    }

    _serverListen()
    {
        this.wsServer = new WebSocket.Server({
            path: "/",
            server: this.server,
            noServer: true,
            verifyClient: false,
            clientTracking: true,
            perMessageDeflate: false,
            maxPayload: 100 * 1024 * 1024,
        });

        this.wsServer.on("connection", this._connection);
        this.wsServer.on("error", this._error);
        this.wsServer.on("close", this._close);

        this.server.listen({
            host: this.listenOptions.host,
            port: this.listenOptions.port,
            ipv6Only: this.listenOptions.ipv6Only,
        });
    }

    _serverClose()
    {
        if (this.wsServer) {
            this.wsServer.close();
        }
        this.server.close();
    }
}

module.exports = WSServer;
