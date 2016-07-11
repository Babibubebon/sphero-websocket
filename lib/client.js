function Client(key, connection) {
  this.key = key;
  this.connection = connection;
  this.linkedOrb = null;
}

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

