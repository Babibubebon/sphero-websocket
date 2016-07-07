function Client(key, connection) {
  this.key = key;
  this.connection = connection;
  this.linkedOrb = null;
}

Client.prototype.setLinkedOrb = function(orb) {
  this.linkedOrb = orb;

  // linkしたことを通知
  orb.link(this.key);
};

Client.prototype.sendMessage = function(data, mesID) {
  if (mesID == null)
    mesID = "";
  var sendData = {
    ID: mesID,
    content: data
  };
  client.connection.sendUTF(JSON.stringify(sendData));
};

Client.prototype.sendCustomMessage = function(name, data, mesID) {
  this.sendMessage({
      type: "custom",
      name: name,
      data: data
  }, mesID);
};

module.exports = Client;

