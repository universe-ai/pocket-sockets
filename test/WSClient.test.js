const assert = require("assert");

jest.mock("tls");
const tls = require("tls");

jest.mock("net");
const net = require("net");

const WSClient = require("../WSClient");

describe("WSClient", () => {
    describe("_socketConnect", () => {
        test("successful call setting USE_TLS", () => {
            assert.doesNotThrow(() => {
                const client = new WSClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": true,
                    "rejectUnauthorized": null
                });
                assert(client.connectOptions.host == "host.com");
                assert(client.connectOptions.port == 99);
                assert(client.connectOptions.secure == true);
                assert(client.connectOptions.rejectUnauthorized == null);

                assert(client.socket == null);
                client._socketConnect();
                assert(client.socket);
                assert(client.socket.onopen);
            });
        });

        test("successful call without USE_TLS", () => {
            assert.doesNotThrow(() => {
                const client = new WSClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": false,
                    "rejectUnauthorized": null
                });
                assert(client.connectOptions.host == "host.com");
                assert(client.connectOptions.port == 99);
                assert(client.connectOptions.secure == false);
                assert(client.connectOptions.rejectUnauthorized == null);

                assert(client.socket == null);
                client._socketConnect();
                assert(client.socket);
                assert(client.socket.onopen);
            });
        });
    });

    describe("_socketHook", () => {
        test("successful call", () => {
            assert.doesNotThrow(() => {
                const client = new WSClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": false,
                    "rejectUnauthorized": null
                });
                client._socketConnect();
                client._socketHook();
            });
        });
    });

    describe("_socketSend", () => {
        test("successful call", () => {
            assert.doesNotThrow(() => {
                const client = new WSClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": false,
                    "rejectUnauthorized": null
                });
                client._socketConnect();
                client.socket = {
                    "send": function(buffer, options) {
                        assert(buffer.toString() == "testdata123");
                        assert(Buffer.isBuffer(buffer));
                        assert(options.binary == true);
                        assert(options.compress == false);
                    }
                };
                client._socketSend(Buffer.from("testdata123"));
            });
        });
    });

    describe("_socketDisconnect", () => {
        test("successful call", () => {
            assert.doesNotThrow(() => {
                const client = new WSClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": false,
                    "rejectUnauthorized": null
                });
                client._socketConnect();
                let hasClosed = false;
                client.socket = {
                    "close": function() {
                        hasClosed = true;
                    }
                };
                assert(hasClosed == false);
                client._socketDisconnect();
                assert(hasClosed == true);
            });
        });
    });
});
