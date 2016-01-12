/*
 * sphero-websocket Server
 * https://github.com/Babibubebon
 */
"use strict";

var WebSocketServer = require('websocket').server;
var http = require('http');
var sphero = require('sphero');
var spheroServer = require('./lib/spheroserver');
var argv = require('argv');
var config = require('./config');

var opts = [
    {name: 'test', type: "boolean"}
];
var args = argv.option(opts).run();

config.sphero.forEach(function(elm) {
    var orb = sphero(elm.port);
    if (!args.options.test)
        orb.connect();
    spheroServer.addOrb(orb, elm.name);
});


var httpServer = http.createServer(function(request, response) {
    response.writeHead(200);
    response.write('This is Sphero WebScoket Server.');
    response.end();
}).listen(config.wsPort, function() {
    console.log((new Date()) + ' Server is listening on port ' + config.wsPort);
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

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept(null, request.origin);
    spheroServer.addClient(request.key, connection);
    console.log((new Date()) + ' Connection from ' + request.remoteAddress + ' accepted');

    connection.on('message', function(message) {
        console.log("client: " + request.key);

        if (message.type === 'utf8') {
            try {
                var data = JSON.parse(message.utf8Data);
            } catch (e) {
                console.error("invalid JSON format");
                return;
            }
            var command = data.command;
            var client = spheroServer.getClient(request.key);
            var orb = spheroServer.getClientsOrb(request.key);

            if (!client || !Array.isArray(data.arguments)) {
                return;
            }

            if (command.substr(0, 1) === "_") {
                // internal command
                switch (command) {
                    case "_list":
                        spheroServer.sendList(request.key, data.ID);
                        break;
                    case "_use":
                        if (data.arguments.length === 1) {
                            spheroServer.setClientsOrb(request.key, data.arguments[0]);
                        }
                        break;
                }
                console.log(command + "(" + data.arguments + ")");
            } else if (command in orb) {
                // Sphero's command
                if (!args.options.test) {
                    orb[command].apply(orb, data.arguments);
                }
                console.log(client.linkedOrb.name + "." + command + "(" + data.arguments.join(",") + ")");
            } else {
                // invalid command
                console.error("invalid command: " + command);
            }
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

process.on('uncaughtException', function(err) {
    console.error(err);
});
