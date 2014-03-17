function SocketInputManager() {
  this.events     = {};
  this.votes      = [0, 0, 0, 0, 0];
  this.html       = {
    action: document.querySelector("#twitch-action"),
    time:   document.querySelector("#twitch-time-bar"),
    vote:   {
            0: document.querySelector("#twitch-vote-up"),
            1: document.querySelector("#twitch-vote-right"),
            2: document.querySelector("#twitch-vote-down"),
            3: document.querySelector("#twitch-vote-left"),
            4: document.querySelector("#twitch-vote-restart")
    }
  }
  this.dirmap     = {
    0: "up",
    1: "right",
    2: "down",
    3: "left",
    4: "restart"
  }


  this.checkVotes();
  this.listen();
}

SocketInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

SocketInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

SocketInputManager.prototype.redrawVotes = function () {
  for (i=0; i < this.votes.length; i++) {
    this.html.vote[i].innerHTML = this.votes[i];
  }
}

SocketInputManager.prototype.setAction = function (action) {
  var elem       = this.html.action;
  elem.classList.remove("new");
  elem.innerHTML = action;
  elem.offsetWidth = elem.offsetWidth; // weird hack
  elem.classList.add("new");
}

SocketInputManager.prototype.checkVotes = function () {
  var self = this;
  setInterval(function(){
    var votes     = self.votes.slice(0); // duplicate
    var max       = Math.max.apply(Math, votes);
    var direction = votes.indexOf(max);
    delete votes[direction];
    if (votes.indexOf(max) == -1) { // unqique max vote
      self.setAction(self.dirmap[direction]);
      self.votes = [0, 0, 0, 0, 0];
      self.redrawVotes();
      if (direction == 4) {
        self.emit("restart");
      } else {
        self.emit("move", direction);
      }
    }
    var elem = self.html.time;
    elem.classList.remove("reset");
    elem.offsetWidth = elem.offsetWidth; // weird hack
    elem.classList.add("reset");
  }, 25000);
}

SocketInputManager.prototype.listen = function () {
  var self = this;
  self.html.time.classList.add("reset");
  ws = new WebSocket("ws://localhost:2048");
  ws.onmessage = function(event) {
    var direction = event.data;
    if (direction >= 0 && direction <= 4) {
      self.votes[direction]++;
      self.redrawVotes();
    }
  }
};

SocketInputManager.prototype.restart = function (event) {
  this.emit("restart");
};
