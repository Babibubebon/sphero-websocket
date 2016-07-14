var Client = require("./client");
var Orb = require("./orb");
var EventEmitter = require("events").EventEmitter;

var spheroServer = module.exports = {
    orbs: {},
    clients: {},
    events: new EventEmitter()
};

spheroServer.addOrb = function(orb, name) {
    if (name == null)
        name = "Sphero_" + (Object.keys(this.orbs).length + 1);
    this.orbs[name] = new Orb(name, orb);
    this.events.emit("addOrb", name, this.orbs[name]);
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

spheroServer.removeOrb = function(name) {
    if (!(this.orbs[name] instanceof Orb)) {
        throw new Error("nameに対するorbは存在しません : " + name);
    }
    this.orbs[name].disconnect();
    this.orbs[name].once("disconnect", () => {
        console.log("Now disconnected from Sphero (" + this.name + ")");
        delete this.orbs[name];
        this.events.emit("removeOrb", name);
    });
};

spheroServer.addClient = function(key, con) {
    this.clients[key] = new Client(key, con);
    this.events.emit("addClient", key, this.clients[key]);
    return this.clients[key];
};

spheroServer.getClient = function(key) {
    if (key == null)
        return this.clients;
    if (key in this.clients)
        return this.clients[key];
    return false;
};

spheroServer.removeClient = function(key) {
    if (!(this.clients[key] instanceof Client)) {
        throw new Error("keyに対するclientは存在しません。 : " + key);
    }
    // unlinkは、どのlinkModeでも自動的に行われる。
    this.clients[key].unlink();
    delete this.clients[key];
    this.events.emit("removeClient", key);
};

spheroServer.getList = function() {
    return Object.keys(this.getOrb());
};

