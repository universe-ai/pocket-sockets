const assert = require("assert");
const AbstractClient = require("../AbstractClient");

describe("AbstractClient", () => {
    describe("constructor", () => {
        test("invalid options", () => {
            let client;
            assert.throws(() => {
                client = new AbstractClient({
                    "nodata": null
                })
            });
        });

        test("valid options", () => {
            assert.doesNotThrow(() => {
                const client = new AbstractClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                });

                assert(client.connectOptions.host == "host.com");
                assert(client.connectOptions.port == 99);
                assert(client.connectOptions.secure == null);
                assert(client.connectOptions.rejectUnauthorized == null);

                assert(client.socket == null);
                assert(client.isDisconnected == false);
                assert(client.bufferData == true);
            });
        });

        test("socket hook triggered", () => {
            let hookFlag = false;
            class TestClient extends AbstractClient {
                _socketHook() {
                    hookFlag = true;
                }
            }

            assert.doesNotThrow(() => {
                assert(hookFlag == false);
                const client = new TestClient(null, {
                    "mysocket": "skt"
                });
                assert(hookFlag == true);
            });
        });
    });

    describe("connect", () => {
        test("socket connect triggered", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                    flag = true;
                }
                _socketHook() {
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, null);
                client.connect();
                assert(flag == true);
            });
        });

        test("socket hook triggered", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, null);
                client.connect();
                assert(flag == true);
            });
        });
    });

    describe("send", () => {
        test("buffer is Buffer", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketSend(buffer) {
                    flag = true;
                    assert(buffer.toString() == "testdata");
                }
                _socketConnect() {
                }
                _socketHook() {
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.send(Buffer.from("testdata"));
                assert(flag == true);
            });
        });

        test("buffer is string", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketSend(buffer) {
                    flag = true;
                    assert(buffer == "testdata");
                }
                _socketConnect() {
                }
                _socketHook() {
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.send("testdata");
                assert(flag == true);
            });
        });

        test("buffer is object", () => {
            class TestClient extends AbstractClient {
                _socketSend(buffer) {
                }
                _socketConnect() {
                }
                _socketHook() {
                }
            }
            assert.throws(() => {
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.send({"testdata": "data"});
            }, /Data must be of Buffer or string type./);
        });

        test("missing socket", () => {
            class TestClient extends AbstractClient {
                _socketSend(buffer) {
                }
                _socketConnect() {
                }
                _socketHook() {
                }
            }
            assert.throws(() => {
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, null);
                client.send("testdata");
            }, /Not connected/);
        });

        test("disconnected", () => {
            class TestClient extends AbstractClient {
                _socketSend(buffer) {
                }
                _socketConnect() {
                }
                _socketHook() {
                }
            }
            assert.throws(() => {
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.isDisconnected = true;
                client.send("testdata");
            }, /Socket is closed, cannot send./);
        });
    });

    describe("disconnect", () => {
        test("isDisconnected does not trigger socketDisconnect", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _socketDisconnect() {
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.isDisconnected = true;
                client.disconnect();
                assert(flag == false);
            });
        });

        test("invalid socket does not trigger socketDisconnect", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _socketDisconnect() {
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.socket = null;
                client.disconnect();
                assert(flag == false);
            });
        });

        test("trigger socketDisconnect", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _socketDisconnect() {
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.disconnect();
                assert(flag == true);
            });
        });
    });

    describe("onError", () => {
        test("trigger error callback", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _on(evt, fn) {
                    assert(evt == "error");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.onError(function(){});
            });
        });
    });

    describe("offError", () => {
        test("trigger error callback", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _on(evt, fn) {
                    assert(evt == "error");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.offError(function(){});
            });
        });
    });

    describe("onData", () => {
        test("trigger data callback", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _on(evt, fn) {
                    assert(evt == "data");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.onData(function(){});
            });
        });
    });

    describe("offData", () => {
        test("trigger data callback", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _on(evt, fn) {
                    assert(evt == "data");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.offData(function(){});
            });
        });
    });

    describe("onConnect", () => {
        test("trigger connect callback", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _on(evt, fn) {
                    assert(evt == "connect");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.onConnect(function(){});
            });
        });
    });

    describe("offConnect", () => {
        test("trigger connect callback", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _on(evt, fn) {
                    assert(evt == "connect");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.offConnect(function(){});
            });
        });
    });

    describe("onDisconnect", () => {
        test("trigger disconnect callback", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _on(evt, fn) {
                    assert(evt == "disconnect");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.onDisconnect(function(){});
            });
        });
    });

    describe("offDisconnect", () => {
        test("trigger disconnect callback", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _on(evt, fn) {
                    assert(evt == "disconnect");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client.offDisconnect(function(){});
            });
        });
    });

    describe("_on", () => {
        test("successful call", () => {
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
            }

            assert.doesNotThrow(() => {
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                assert(!client.eventHandlers["myevent"]);
                client._on("myevent", function(){});
                assert(client.eventHandlers["myevent"]);
            });
        });
    });

    describe("_off", () => {
        test("successful call", () => {
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
            }

            assert.doesNotThrow(() => {
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                const fn = function(){};
                client._on("myevent", fn);
                assert(client.eventHandlers["myevent"]);
                client._off("myevent", fn);
            });
        });
    });

    describe("_disconnect", () => {
        test("successful call", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _triggerEvent() {
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                assert(flag == false);
                assert(client.isDisconnected == false);
                client._disconnect();
                assert(flag == true);
                assert(client.isDisconnected == true);
            });
        });
    });

    describe("_data", () => {
        test("data is string", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _triggerEvent(evt) {
                    assert(evt == "data");
                    flag = true;
                }
            }

            assert.throws(() => {
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client._data("data");
            }, /Must read buffer/);
        });

        test("data is Buffer", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _triggerEvent(evt) {
                    assert(evt == "data");
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                assert(flag == false);
                client._data(Buffer.from("data"));
                assert(flag == true);
            });
        });
    });

    describe("_connect", () => {
        test("successful call", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _triggerEvent(evt) {
                    assert(evt == "connect");
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                client._connect("data");
            });
        });
    });

    describe("_error", () => {
        test("successful call", () => {
            let flag = false;
            class TestClient extends AbstractClient {
                _socketConnect() {
                }
                _socketHook() {
                }
                _triggerEvent(evt) {
                    assert(evt == "error");
                    flag = true;
                }
            }

            assert.doesNotThrow(() => {
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null
                }, {});
                assert(flag == false);
                client._error("msg");
                assert(flag == true);
            });
        });
    });

    describe("ValidateConfig", () => {
        test("all options", () => {
            assert.doesNotThrow(() => {
                const client = new AbstractClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": null,
                    "rejectUnauthorized": null,
                    "cert": "mycert",
                    "key": "mykey",
                    "ca": "myca",
                });

                assert(client.connectOptions.host == "host.com");
                assert(client.connectOptions.port == 99);
                assert(client.connectOptions.secure == null);
                assert(client.connectOptions.rejectUnauthorized == null);
                assert(client.connectOptions.cert == "mycert");
                assert(client.connectOptions.key == "mykey");
                assert(client.connectOptions.ca == "myca");
            });
        });
    });
});
