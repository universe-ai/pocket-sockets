const assert = require("assert");

jest.mock("tls");
const tls = require("tls");

jest.mock("net");
const net = require("net");

const TCPServer = require("../TCPServer");
const TCPClient = require("../TCPClient");

describe("TCPServer", () => {
    describe("constructor", () => {
        test("missing listenOptions", () => {
            assert.throws(() => {
                const server = new TCPServer();
            }, /Bad options/);
        });

        test("successful call with cert", () => {
            assert.doesNotThrow(() => {
                tls.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                });
                const server = new TCPServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null,
                    "cert": "valid-certificate"
                });
                assert(server.SocketType == TCPClient);
            });
        });

        test("successful call without TLS", () => {
            assert.doesNotThrow(() => {
                net.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                });
                const server = new TCPServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                });
                assert(server.SocketType == TCPClient);
            });
        });
    });


    describe("_serverCreate", () => {
        test("successful call with USE_TLS", () => {
            assert.doesNotThrow(() => {
                tls.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                });
                const server = new TCPServer({
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
                net.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                });
                const server = new TCPServer({
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
                tls.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                });
                const server = new TCPServer({
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
                tls.createServer = jest.fn().mockReturnValue({
                    "on": function(name, fn) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    },
                    "listen": function(options) {
                        assert(options.host == "host.com");
                        assert(options.port == 99);
                        assert(!options.ipv6Only); 
                    }

                });

                const server = new TCPServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null,
                    "cert": "valid-certificate"
                });
                server._serverListen();
            });
        });
    });
});
