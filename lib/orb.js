var EventEmitter = require("events").EventEmitter;
var util = require("util");

function Orb(name, instance, port) {
  EventEmitter.call(this);

  this.name = name;
  this.instance = instance;
  this.port = port;
  this.lock = false;
  this.linkedClients = [];
}

util.inherits(Orb, EventEmitter);

Orb.prototype.link = function(clientKey) {
  this.linkedClients.push(clientKey);
};

Orb.prototype.unlink = function(clientKey) {
  if (this.linkedClients.indexOf(clientKey) < 0) {
    throw new Error("unlinkしようとしたclientKeyは存在しません。");
  }
  this.linkedClients.splice(this.linkedClients.indexOf(clientKey), 1);
};

Orb.prototype.command = function(commandName, args) {
  if (!this.hasCommand(commandName)) {
    throw new Error("commandNameは存在しませんでした。 : " + commandName);
  }
  this.instance[commandName].apply(this.instance, args);
};

Orb.prototype.hasCommand = function(commandName) {
  return commandName in this.instance;
};

Orb.prototype.disconnect = function() {
  this.instance.disconnect(() => {
    this.emit("disconnect");
  });
};

module.exports = Orb;

