var spheroServer = module.exports = {
    orbs: {},
    clients: {}
};

spheroServer.addOrb = function(orb, name) {
    if (name == null)
        name = "Sphero_" + (Object.keys(this.orbs).length + 1);
    this.orbs[name] = {
        name: name,
        instance: orb,
        lock: false
    };
};

spheroServer.getOrb = function(name) {
    if (name == null)
        return this.orbs;
    if (name in this.orbs)
        return this.orbs[name];
    return false;
};

spheroServer.addClient = function(key, con) {
    this.clients[key] = {
        connection: con,
        linkedOrb: this.orbs[Object.keys(this.orbs)[0]]
    };
};

spheroServer.getClient = function(key) {
    if (key == null)
        return this.clients;
    if (key in this.clients)
        return this.clients[key];
    return false;
};

spheroServer.getClientsOrb = function(key) {
    if (key in this.clients)
        return this.getClient(key).linkedOrb.instance;
    return false;
};

spheroServer.setClientsOrb = function(key, name) {
    if (key in this.clients && name in this.orbs) {
        this.clients[key].linkedOrb = this.getOrb(name);
        return true;
    } else {
        return false;
    }
};

spheroServer.sendList = function(key, mesID) {
    var orbs = this.getOrb();
    this.sendMes(key, Object.keys(orbs), mesID);
};

spheroServer.sendMes = function(key, data, mesID) {
    var client = this.getClient(key);
    if (client == null)
        return false;
    if (mesID == null)
        mesID = "";
    
    var sendData = {
        ID: mesID,
        content: data
    };
    client.connection.sendUTF(JSON.stringify(sendData));
};
