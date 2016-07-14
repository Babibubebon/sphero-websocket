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
        if (config.linkMode === "multiple" && Object.keys(spheroServer.getUnlinkedOrbs()).length === 0) {
            request.reject();
            console.log("orbの数がcontrollerに対して足りませんのでreject!");
        }

        var connection = request.accept(null, request.origin);
        var client = spheroServer.addClient(request.key, connection);
        if (config.linkMode === "multiple") {
            var unlinkedOrbs = spheroServer.getUnlinkedOrbs();
            client.setLinkedOrb(unlinkedOrbs[Object.keys(unlinkedOrbs)[0]]);
        } else if (config.linkMode === "single") {
            client.setLinkedOrb(spheroServer.getOrb(0));
        }
        console.log((new Date()) + " Connection from " + request.remoteAddress + " accepted");

        client.on("message", function() {
            console.log("client: " + request.key);
        });
        client.on("arriveInternalCommand", function(command, args) {
            // internal command
            switch (command) {
                case "_list":
                    client.sendMessage(spheroServer.getList(), data.ID);
                    break;
                case "_use":
                    if (args.length === 1) {
                        client.setClientsOrb(spheroServer.getOrb(args[0]));
                    }
                    break;
            }
            console.log(command + "(" + data.arguments + ")");
        });
        client.on("arriveNormalCommand", function(command, args) {
            var orb = client.linkedOrb;
            if (orb !== null) {
                if (orb.hasCommand(command)) {
                    // Sphero"s command
                    if (!isTestMode) {
                        orb.command(command, args);
                    }
                    console.log(orb.name + "." + command + "(" + args.join(",") + ")");
                    externalEvent.emit("command", request.key, command, args);
                } else {
                    // invalid command
                    console.error("invalid command: " + command);
                }
            }
        });
        connection.on("close", function(reasonCode, description) {
            spheroServer.removeClient(request.key);
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

