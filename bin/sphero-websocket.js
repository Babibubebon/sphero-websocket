#!/usr/bin/env node

var config = require(process.cwd() + "/sphero-ws-config");
var server = require("../server");

server(config);

