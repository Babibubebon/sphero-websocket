/*
 * sphero-websocket Server
 * https://github.com/Babibubebon
 */
"use strict";
var WebSocketServer = require("websocket").server;
var http = require("http");
var sphero = require("sphero");
var spheroServer = require("./lib/spheroserver");
var fs = require("fs");
var EventEmitter = require("events").EventEmitter;

module.exports = function(config, isTestMode) {
    var externalEvent = new EventEmitter();

    if (isTestMode) {
      console.log("running test-mode");
    }

    config.sphero.forEach(function(elm) {
        var orb = sphero(elm.port);
        if (!isTestMode)
            orb.connect();
        spheroServer.addOrb(orb, elm.name);
    });


    var httpServer = http.createServer(function(request, response) {
        var clientDir = "/client/";
        if (request.url.substring(0, clientDir.length) === clientDir) {
            var url = request.url.substring(clientDir.length);
            url = url === "" ? "index.html" : url;
            // 拡張可能。拡張子からMIMEタイプをとる。
            var contentTypes = {
                "html": "text/html",
                "js": "text/javascript"
            };
            response.writeHead(200, { "Content-Type": contentTypes[url.split(".").reverse()[0]]});
            fs.readFile(__dirname + clientDir + url, "utf-8", function(err, data) {
                if (err) {
                    throw err;
                }
                response.write(data);
                response.end();
            });
        } else {
            response.writeHead(200);
            response.write("This is Sphero WebSocket Server.");
            response.end();
        }
    }).listen(config.wsPort, function() {
        console.log((new Date()) + " Server is listening on port " + config.wsPort);
    });

    var wsServer = new WebSocketServer({
        httpServer: httpServer,
        autoAcceptConnections: false
    });

    function originIsAllowed(origin) {
        if (config.allowedOrigin == null || config.allowedOrigin === "*")
            return true;
        if (config.allowedOrigin === origin)
            return true;
        if (Array.isArray(config.allowedOrigin) && config.allowedOrigin.indexOf(origin) >= 0)
            return true;
        return false;
    }

    wsServer.on("request", function(request) {
        if (!originIsAllowed(request.origin)) {
            request.reject();
            console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
            return;
        }

        var connection = request.accept(null, request.origin);
        var client = spheroServer.addClient(request.key, connection);
        if (config.isMultipleMode) {
            var unlinkedOrbs = spheroServer.getUnlinkedOrbs();
            client.setLinkedOrb(unlinkedOrbs[Object.keys(unlinkedOrbs)[0]]);
        } else {
            client.setLinkedOrb(spheroServer.getOrb(0));
        }
        externalEvent.emit("addClient", request.key, spheroServer.getClient(request.key));
        console.log((new Date()) + " Connection from " + request.remoteAddress + " accepted");

        connection.on("message", function(message) {
            console.log("client: " + request.key);

            if (message.type === "utf8") {
                try {
                    var data = JSON.parse(message.utf8Data);
                } catch (e) {
                    console.error("invalid JSON format");
                    return;
                }
                var command = data.command;
                var orb = client.linkedOrb;

                if (!client || !Array.isArray(data.arguments)) {
                    return;
                }

                if (command.substr(0, 1) === "_") {
                    // internal command
                    switch (command) {
                        case "_list":
                            client.sendMessage(spheroServer.getList(), data.ID);
                            break;
                        case "_use":
                            if (data.arguments.length === 1) {
                                client.setClientsOrb(spheroServer.getOrb(data.arguments[0]));
                            }
                            break;
                        case "_custom":
                            externalEvent.emit("customMes", request.key, data.arguments[0], data.arguments[1], data.ID);
                            break;
                    }
                    console.log(command + "(" + data.arguments + ")");
                } else if (orb.hasCommand(command)) {
                    // Sphero"s command
                    if (!isTestMode) {
                        orb.command(command, data.arguments);
                    }
                    console.log(orb.name + "." + command + "(" + data.arguments.join(",") + ")");
                    externalEvent.emit("command", request.key, command, data.arguments);
                } else {
                    // invalid command
                    console.error("invalid command: " + command);
                }
            }
        });
        connection.on("close", function(reasonCode, description) {
            client.unlink();
            console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
        });
    });

    process.on("uncaughtException", function(err) {
        console.error(err);
    });

    return {
        events: externalEvent,
        // ↓セキュリティ的にOKなのか
        spheroServer: spheroServer
    };
};

