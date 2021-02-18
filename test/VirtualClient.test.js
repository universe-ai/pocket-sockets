const assert = require("assert");
const CreatePair = require("../VirtualClient");

describe("VirtualClient", () => {
    describe("constructor", () => {
        test.skip("missing pairedSocket", () => {
            let client;
            assert.doesNotThrow(() => {
                client = new VirtualClient();
                assert(!client.pairedSocket);
            });
        });

        test("successful call", () => {
            let client;
            assert.doesNotThrow(() => {
                let client1, client2;
                [client1, client2 ] = CreatePair();
                assert(client1.pairedSocket);
                assert(client2.pairedSocket);
                assert(client2.pairedSocket.pairedSocket);
            });
        });
    });

    describe("setLatency", () => {
        test("successful call", () => {
            let client;
            assert.doesNotThrow(() => {
                let client1, client2;
                [client1, client2 ] = CreatePair();
                assert(client1.latency == 0);
                client1.setLatency(20);
                assert(client1.latency == 20);
            });
        });
    });

    describe("_socketSend", () => {
        test.skip("call without paired socket", () => {
            let client;
            assert.doesNotThrow(() => {
                client = new VirtualClient();
                assert(client.outQueue.length == 0);
                client._socketSend(Buffer.from("testdata"));
                assert(client.outQueue.length == 0);
            });
        });

        test("successful call", () => {
            let client;
            assert.doesNotThrow(() => {
                let client1, client2;
                [client1, client2 ] = CreatePair();
                assert(client1.outQueue.length == 0);

                let called = false;
                client1._copyToPaired = function() {
                    called = true;
                }

                client1._socketSend(Buffer.from("testdata"));
                assert(called == true);
            });
        });
    });

    describe("_socketDisconnect", () => {
        test("successful call", () => {
            let client;
            assert.doesNotThrow(() => {
                let client1, client2;
                [client1, client2 ] = CreatePair();

                let disconnectCounter = 0;
                client1._disconnect = function() {
                    disconnectCounter++;
                }
                client2._disconnect = function() {
                    disconnectCounter++;
                }

                assert(disconnectCounter == 0);
                client1._socketDisconnect();
                assert(disconnectCounter == 2);
            });
        });
    });

    describe("_copyToPaired", () => {
        test("successful call", () => {
            let client;
            assert.doesNotThrow(() => {
                let client1, client2;
                [client1, client2 ] = CreatePair();

                let copiedBuffer;
                client2._data = function(buffer) {
                    if(buffer) {
                        copiedBuffer = buffer;
                    }
                }

                client1._socketSend(Buffer.from("fromclient1"));
                client1._copyToPaired();
                assert(copiedBuffer.toString() == "fromclient1");
            });
        });
    });


});
