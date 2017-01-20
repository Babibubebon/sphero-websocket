/*
 * sphero-websocket Client
 * https://github.com/Babibubebon
 */

(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.sphero = factory());
})(this, (function() {
  var sphero = function() {
    this.ws = null;
    this.wsUri = null;
    this._resQueue = {};
  };

  sphero.prototype.connect = function(uri, successCallback, errorCallback) {
    if (this.ws)
      return;

    this.wsUri = uri;
    this.ws = new WebSocket(uri);

    this.ws.onopen = function() {
      if (typeof successCallback === "function")
        successCallback(this.ws);
    }.bind(this);

    this.ws.onclose = function() {
      this.ws = null;
      this._resQueue = {};
    }.bind(this);

    this.ws.onerror = function(e) {
      if (typeof errorCallback === "function")
        errorCallback(e);
    };

    this.ws.onmessage = function(message) {
      console.log(message.data);
      var data;
      try {
        data = JSON.parse(message.data);
      } catch(e) {
        console.log(e);
        return;
      }
      if (typeof data.ID !== "undefined") {
        if (data.ID in this._resQueue) {
          this._resQueue[data.ID](data.content);
        } else if (data.content.type && data.content.type === "custom") {
          if (data.content.name && typeof this.customMessageListeners[data.content.name] !== "undefined") {
            this.customMessageListeners[data.content.name].forEach(listener => {
              listener(data.content.data);
            });
          }
        }
      }
    }.bind(this);

    this.customMessageListeners = {};
  };

  sphero.prototype.disconnect = function() {
    if (this.ws == null)
      return;
    this.ws.close();
  };

  sphero.prototype.send = function(cmd, args, resCallback) {
    if (this.ws == null)
      return;
    var mesID = (new Date()).getTime().toString() + Math.floor(Math.random() * 1000);
    if (typeof resCallback === "function") {
      this._resQueue[mesID] = resCallback;
    }

    var data = {
      command: cmd,
      arguments: args,
      ID: mesID
    };
    this.ws.send(JSON.stringify(data));
  };

  sphero.prototype.getList = function(callback) {
    this.send("_list", [], callback);
  };

  sphero.prototype.use = function(name, callback) {
    this.send("_use", [name], callback);
  };

  // sphero-websocket server側の外側とのメッセージ交換用
  sphero.prototype.listenCustomMessage = function(name, callback) {
    if (typeof this.customMessageListeners[name] === "undefined") {
      this.customMessageListeners[name] = [];
    }
    this.customMessageListeners[name].push(function(data) {
      callback(data);
    });
  };

  sphero.prototype.sendCustomMessage = function(name, data, callback) {
    this.send("_custom", [name, data], callback);
  };

  sphero.commands = [
    /* sphero.js */
    "setHeading",
    "setStabilization",
    "setRotationRate",
    "setCreationDate",
    "getBallRegWebsite",
    "reEnableDemo",
    "getChassisId",
    "setChassisId",
    "selfLevel",
    "setVdl",
    "setDataStreaming",
    "setCollisionDetection",
    "locator",
    "setAccelerometer",
    "readLocator",
    "setRgbLed",
    "setBackLed",
    "getRgbLed",
    "roll",
    "boost",
    "move",
    "setRawMotors",
    "setMotionTimeout",
    "setOptionsFlag",
    "getOptionsFlag",
    "setTempOptionFlags",
    "getTempOptionFlags",
    "getConfigBlock",
    "setSsbParams",
    "setDeviceMode",
    "setConfigBlock",
    "getDeviceMode",
    "getSsb",
    "setSsb",
    "ssbRefill",
    "ssbBuy",
    "ssbUseConsumeable",
    "ssbGrantCores",
    "ssbAddXp",
    "ssbLevelUpAttr",
    "getPwSeed",
    "ssbEnableAsync",
    "runMacro",
    "saveTempMacro",
    "saveMacro",
    "initMacroExecutive",
    "abortMacro",
    "macroStatus",
    "setMacroParam",
    "appendTempMacroChunk",
    "eraseOBStorage",
    "appendOBFragment",
    "execOBProgram",
    "abortOBProgram",
    "answerInput",
    "commitToFlash",
    "commitToFlashAlias",
    /* custom.js */
    "streanData",
    "color",
    "randomColor",
    "getColor",
    "detectCollisions",
    "startCalibration",
    "finishCalibration",
    "streamOdometer",
    "streamVelocity",
    "streamAccelOne",
    "streamImuAngles",
    "streamAccelerometer",
    "streamGyroscope",
    "streamMotorsBackEmf",
    "stopOnDisconnect",
    "stop"
  ];

  sphero.commands.forEach(function(command) {
    sphero.prototype[command] = function() {
      var argsArray = [];
      for (var i = 0; i < arguments.length; i++) {
        argsArray.push(arguments[i]);
      }
      this.send(command, argsArray);
    };
  });

  return sphero;
}));

