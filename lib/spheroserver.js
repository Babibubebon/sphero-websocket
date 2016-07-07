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

spheroServer.getOrbCount = function() {
    return Object.keys(this.orbs).length;
};

spheroServer.addClient = function(key, con, orbIndex) {
    if (typeof orbIndex === "undefined") {
        orbIndex = 0;
    } else {
        if (orbIndex >= this.getOrbCount()) {
            throw new Error("orbIndex " + orbIndex + " は、lengthを超えています。");
        }
    }
    this.clients[key] = {
        connection: con,
        linkedOrb: this.orbs[Object.keys(this.orbs)[orbIndex]]
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

spheroServer.sendCustomMes = function(key, name, data, mesID) {
    spheroServer.sendMes(key, {
        type: "custom",
        name: name,
        data: data
    }, mesID);
};
