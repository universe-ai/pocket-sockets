const assert = require("assert");
const AbstractServer = require("../AbstractServer");

describe("AbstractServer", () => {
    describe("constructor", () => {
        test("invalid options", () => {
            let server;
            assert.throws(() => {
                server = new AbstractServer({
                    "nodata": null
                })
            });
        });

        test("valid options", () => {
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                });

                assert(server.listenOptions.host == "host.com");
                assert(server.listenOptions.port == 99);
                assert(server.listenOptions.rejectUnauthorized == null);

                assert(server.SocketType == null);
                assert(server.server == null);
                assert(server.clients.length == 0);
                assert(server.isDisconnected == false);
            });
        });

        test("server create triggered", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                });
                assert(flag == true);
                assert(server);
            });
        });
    });

    describe("_serverClose", () => {
        test("trigger server close", () => {
            let flag = false;
            const modifiedServer = {
                "close": function() {
                    flag = true;
                }
            }
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                server.server = modifiedServer;
                assert(flag == false);
                server._serverClose();
                assert(flag == true);
            });
        });
    });

    describe("listen", () => {
        test("trigger server listen", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _serverListen() {
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                assert(flag == false);
                server.listen();
                assert(flag == true);
            });
        });
    });

    describe("close", () => {
        test("server is invalid", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _serverClose() {
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                server.server = null;
                assert(flag == false);
                server.close();
                assert(flag == false);
            });
        });

        test("call server close", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _serverClose() {
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                assert(flag == false);
                server.server = {};
                server.close();
                assert(flag == true);
            });
        });

        test("call clients disconnect", () => {
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _serverClose() {
                }
            }

            let clientDisconnectCounter = 0;
            class Client {
                disconnect() {
                    clientDisconnectCounter++;
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});

                server.server = {};
                server.clients.push(new Client());
                server.clients.push(new Client());
                server.clients.push(new Client());

                assert(server.clients.length == 3);
                assert(clientDisconnectCounter == 0);
                server.close();
                assert(server.clients.length == 0);
                assert(clientDisconnectCounter == 3);
            });
        });
    });

    describe("onConnection", () => {
        test("trigger connection callback", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _on(evt, fn) {
                    assert(evt == "connection");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                server.onConnection(function(){});
            });
        });
    });

    describe("onError", () => {
        test("trigger error callback", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _on(evt, fn) {
                    assert(evt == "error");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                server.onError(function(){});
            });
        });
    });

    describe("onClose", () => {
        test("trigger close callback", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _on(evt, fn) {
                    assert(evt == "close");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                server.onClose(function(){});
            });
        });
    });

    describe("_addClient", () => {
        test("successful call", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _triggerEvent(evt) {
                    assert(evt == "connection");
                    flag = true;
                }
            }

            let clientOnDisconnectCounter = 0;
            class Client {
                onDisconnect() {
                    clientOnDisconnectCounter++;
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                assert(flag == false);
                assert(server.clients.length == 0);
                assert(clientOnDisconnectCounter == 0);
                server._addClient(new Client());
                assert(flag == true);
                assert(server.clients.length == 1);
                assert(clientOnDisconnectCounter == 1);
            });
        });
    });

    describe("_removeClient", () => {
        test("successful call", () => {
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _triggerEvent(evt) {
                }
            }
            class Client {
                onDisconnect() {
                }
            }
            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                assert(server.clients.length == 0);
                const client = new Client();
                server._addClient(client);
                assert(server.clients.length == 1);
                server._removeClient(client);
                assert(server.clients.length == 0);
            });
        });
    });

    describe("_connection", () => {
        test("successful call", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _addClient(client) {
                    assert(client);
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                class MySocket {
                    constructor(_, socket) {
                        assert(socket);
                    }
                }
                server.SocketType  = MySocket;
                assert(flag == false);
                server._connection("data");
                assert(flag == true);
            });
        });
    });

    describe("_error", () => {
        test("successful call", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _triggerEvent(evt) {
                    assert(evt == "error");
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                assert(flag == false);
                server._error("msg");
                assert(flag == true);
            });
        });
    });

    describe("_close", () => {
        test("successful call", () => {
            let flag = false;
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _triggerEvent(evt) {
                    assert(evt == "close");
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                assert(flag == false);
                server._close();
                assert(flag == true);
            });
        });
    });
    describe("_on", () => {
        test("successful call", () => {
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
                _socketHook() {
                }
            }

            assert.doesNotThrow(() => {
                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "rejectUnauthorized": null
                }, {});
                assert(!server.eventHandlers["myevent"]);
                server._on("myevent", function(){});
                assert(server.eventHandlers["myevent"]);
            });
        });
    });

    describe("ValidateConfig", () => {
        test("all options", () => {
            assert.doesNotThrow(() => {
                class TestServer extends AbstractServer {
                    _serverCreate() {
                    }
                }

                const server = new TestServer({
                    "host": "host.com",
                    "port": 99,
                    "ipv6Only": false,
                    "rejectUnauthorized": null,
                    "requestCert": true,
                    "cert": "mycert",
                    "key": "mykey",
                    "ca": "myca",
                });

                assert(server.listenOptions.host == "host.com");
                assert(server.listenOptions.port == 99);
                assert(server.listenOptions.ipv6Only == false);
                assert(server.listenOptions.rejectUnauthorized == null);
                assert(server.listenOptions.requestCert == true);
                assert(server.listenOptions.cert == "mycert");
                assert(server.listenOptions.key == "mykey");
                assert(server.listenOptions.ca == "myca");
            });
        });
    });
});
