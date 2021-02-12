const assert = require("assert");

jest.mock("tls");
const tls = require("tls");

jest.mock("net");
const net = require("net");

const TCPClient = require("../TCPClient");

describe("TCPClient", () => {
    describe("_socketConnect", () => {
        test("successful call setting USE_TLS", () => {
            assert.doesNotThrow(() => {
                const client = new TCPClient({
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
                assert(client.isDisconnected == false);
                assert(client.bufferData == true);

                tls.connect = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "secureConnect");
                        assert(typeof fn == "function");
                    }
                });
                client._socketConnect();
            });
        });

        test("successful call without USE_TLS", () => {
            assert.doesNotThrow(() => {
                const client = new TCPClient({
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
                assert(client.isDisconnected == false);
                assert(client.bufferData == true);

                net.connect = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "connect");
                        assert(typeof fn == "function");
                    }
                });
                client._socketConnect();
            });
        });
    });

    describe("_socketHook", () => {
        test("successful call", () => {
            assert.doesNotThrow(() => {
                const client = new TCPClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": false,
                    "rejectUnauthorized": null
                });
                let counter = 0;
                client.socket = {
                    "on": function(name, fn) {
                        counter++;
                        assert(name == "data" || name == "error" || name == "close" );
                        assert(typeof fn == "function");
                    }
                };
                assert(counter == 0);
                client._socketHook();
                assert(counter == 3);
            });
        });
    });

    describe("_socketSend", () => {
        test("successful call", () => {
            assert.doesNotThrow(() => {
                const client = new TCPClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": false,
                    "rejectUnauthorized": null
                });
                client.socket = {
                    "write": function(buffer) {
                        assert(buffer.toString() == "testdata123");
                        assert(Buffer.isBuffer(buffer));
                    }
                };
                client._socketSend(Buffer.from("testdata123"));
            });
        });
    });

    describe("_socketDisconnect", () => {
        test("successful call", () => {
            assert.doesNotThrow(() => {
                const client = new TCPClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": false,
                    "rejectUnauthorized": null
                });
                let hasEnded = false;
                client.socket = {
                    "end": function() {
                        hasEnded = true;
                    }
                };
                assert(hasEnded == false);
                client._socketDisconnect();
                assert(hasEnded == true);
            });
        });
    });
});
