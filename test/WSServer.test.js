const assert = require("assert");

jest.mock("https");
const https = require("https");

jest.mock("http");
const http = require("http");

jest.mock("ws");
const WebSocket = require("ws");

const WSServer = require("../WSServer");
const WSClient = require("../WSClient");

describe("WSServer", () => {
    describe("constructor", () => {
        test("missing listenOptions", () => {
            assert.throws(() => {
                const server = new WSServer();
            }, /Bad options/);
        });

        test("successful call with cert", () => {
            assert.doesNotThrow(() => {
                https.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                });
                const server = new WSServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null,
                    "cert": "valid-certificate"
                });
                assert(server.wsServer == null);
                assert(server.SocketType == WSClient);
            });
        });

        test("successful call without TLS", () => {
            assert.doesNotThrow(() => {
                http.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                });
                const server = new WSServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                });
                assert(server.wsServer == null);
                assert(server.SocketType == WSClient);
            });
        });
    });

    describe("_serverCreate", () => {
        test("successful call with USE_TLS", () => {
            assert.doesNotThrow(() => {
                https.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                });
                const server = new WSServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null,
                    "cert": "valid-certificate"
                });
                assert(server.server);
            });
        });

        test("successful call without USE_TLS", () => {
            assert.doesNotThrow(() => {
                http.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                });
                const server = new WSServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                });
                assert(server.server);
            });
        });
    });

    describe("_serverListen", () => {
        test("overwritten server after object creation", () => {
            assert.throws(() => {
                https.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                });
                const server = new WSServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null,
                    "cert": "valid-certificate"
                });
                server.server = null;
                server._serverListen();
            });
        });

        test("successful call", () => {
            assert.doesNotThrow(() => {
                https.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError" || name == "listening" || name == "upgrade");
                        assert(typeof fn == "function");
                    },
                    "listen": function(options) {
                        assert(options.host == "host.com");
                        assert(options.port == 99);
                        assert(!options.ipv6Only); 
                    }
                });

                WebSocket.Server = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "connection" || name == "error" || name == "close"); 
                        assert(typeof fn == "function");
                    }
                });

                const server = new WSServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null,
                    "cert": "valid-certificate"
                });
                server._serverListen();
            });
        });
    });

    describe("_serverClose", () => {
        test("successful call", () => {
            assert.doesNotThrow(() => {
                https.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                    },
                    "listen": function(options) {
                    }
                });
                WebSocket.Server = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                    }
                });
                const server = new WSServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null,
                    "cert": "valid-certificate"
                });
                server._serverListen();

                let callCount = 0;
                server.server.close = function() {
                    callCount++;
                }
                server.wsServer.close = function() {
                    callCount++;
                }
                assert(callCount == 0);
                server._serverClose();
                assert(callCount == 2);
            });
        });
    });
});
