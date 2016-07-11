var EventEmitter = require("events").EventEmitter;
var util = require("util");

function Client(key, connection) {
  this.key = key;
  this.connection = connection;
  this.linkedOrb = null;

  this.connection.on("message", (message) => {
    this.emit("message");
    if (message.type === "utf8") {
      try {
        var data = JSON.parse(message.utf8Data);
      } catch (e) {
        console.error("invalid JSON format");
        return;
      }
      if (!Array.isArray(data.arguments)) {
        return;
      }

      var command = data.command;

      if (command === "_custom") {
        // name, data, mesID
        this.emit("arriveCustomMessage", data.arguments[0], data.arguments[1], data.ID);
      } else if (command.substr(0, 1) === "_") {
        this.emit("arriveInternalCommand", command, data.arguments);
      } else {
        this.emit("arriveNormalCommand", command, data.arguments);
      }
    }
  });
}

util.inherits(Client, EventEmitter);

Client.prototype.setLinkedOrb = function(orb) {
  this.linkedOrb = orb;

  // linkしたことを通知
  this.linkedOrb.link(this.key);
};

Client.prototype.unlink = function() {
  this.linkedOrb.unlink(this.key);
  this.linkedOrb = null;
};

Client.prototype.sendMessage = function(data, mesID) {
  if (mesID == null)
    mesID = "";
  var sendData = {
    ID: mesID,
    content: data
  };
  this.connection.sendUTF(JSON.stringify(sendData));
};

Client.prototype.sendCustomMessage = function(name, data, mesID) {
  this.sendMessage({
      type: "custom",
      name: name,
      data: data
  }, mesID);
};

module.exports = Client;

