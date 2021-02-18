const AbstractClient = require("./AbstractClient.js");

class VirtualClient extends AbstractClient
{
    /**
     * @constructor
     * @param {VirtualSocket} [pairedSocket] When creating the second socket of a socket-pair provide the first socket as argument to get them paired.
     */
    constructor(pairedSocket)
    {
        super(null, {});

        this.pairedSocket = pairedSocket;

        /** We can set this to simulate some latency in the paired socket communication */
        this.latency = 0;  // Milliseconds

        /**
         * Queue of outgoing messages.
         * We need this if we use simulated latency,
         * because the ordering of setTimeout might not be guaranteed
         * for identical timeout values.
         */
        this.outQueue = [];

        /* Complete the pair by assigning this socket to the paired socket */
        if (this.pairedSocket) {
            this.pairedSocket.pairedSocket = this;
        }
    }

    /**
     * Set a simulated latency of the socket communications.
     *
     * @param {number} latency in milliseconds for each send
     */
    setLatency(latency)
    {
        this.latency = latency;
    }

    /**
     * Hook events on the socket.
     */
    _socketHook()
    {
        // We handle events in different ways since this is not an actual socket.
    }

    /**
     * Send the given buffer on socket.
     * @param {Buffer} buffer
     */
    _socketSend(buffer)
    {
        // Put msg into paired socket.
        if (this.pairedSocket) {
            this.outQueue.push(buffer);
            if (this.latency > 0) {
                setTimeout( () => this._copyToPaired(), this.latency);
            } else {
                this._copyToPaired();
            }
        }
    }

    /**
     * Specify the paired disconnect procedure.
     */
    _socketDisconnect()
    {
        if (this.pairedSocket) {
            this.pairedSocket._disconnect();
        }
        this._disconnect();
    }

    /**
     * Internal function to copy one message in the out queue to the paired socket.
     *
     */
    _copyToPaired()
    {
        const buffer = this.outQueue.shift();
        this.pairedSocket._data(buffer);
    }
}

function CreatePair()
{
    const socket1 = new VirtualClient();
    const socket2 = new VirtualClient(socket1);
    return [socket1, socket2];
}

module.exports = CreatePair;
