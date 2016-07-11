var Client = require("./client");
var Orb = require("./orb");

var spheroServer = module.exports = {
    orbs: {},
    clients: {}
};

spheroServer.addOrb = function(orb, name) {
    if (name == null)
        name = "Sphero_" + (Object.keys(this.orbs).length + 1);
    this.orbs[name] = new Orb(name, orb);
};

spheroServer.getOrb = function(name) {
    if (name == null)
        return this.orbs;
    if (typeof name === "number")
        return this.orbs[Object.keys(this.orbs)[name]];
    if (name in this.orbs)
        return this.orbs[name];
    return false;
};

spheroServer.getUnlinkedOrbs = function() {
    var resultObject = {};
    Object.keys(this.orbs).filter(orbName => {
        var orb = this.orbs[orbName];
        return orb.linkedClients.length === 0;
    }).forEach(orbName => {
        resultObject[orbName] = this.orbs[orbName];
    });
    return resultObject;
};

spheroServer.addClient = function(key, con) {
    this.clients[key] = new Client(key, con);
    return this.clients[key];
};

spheroServer.getClient = function(key) {
    if (key == null)
        return this.clients;
    if (key in this.clients)
        return this.clients[key];
    return false;
};

spheroServer.getList = function() {
    return Object.keys(this.getOrb());
};

