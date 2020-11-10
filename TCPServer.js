const net = require("net");
const tls = require("tls");

const TCPClient = require("./TCPClient");
const AbstractServer = require("./AbstractServer");

class TCPServer extends AbstractServer
{
    constructor(listenOptions)
    {
        super(listenOptions);
        this.SocketType = TCPClient;
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
            this.server = tls.createServer(tlsOptions);
            this.server.on("secureConnection", this._connection);
        }
        else {
            this.server = net.createServer();
            this.server.on("connection", this._connection);
        }

        this.server.on("error", this._error);
        this.server.on("close", this._close);
        this.server.on("tlsClientError", (_err, socket) => socket.end());
    }

    _serverListen()
    {
        this.server.listen({
            host: this.listenOptions.host,
            port: this.listenOptions.port,
            ipv6Only: this.listenOptions.ipv6Only,
        });
    }
}

module.exports = TCPServer;
