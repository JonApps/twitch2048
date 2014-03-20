var net        = require('net');
var parse_irc  = require('irc-message');
var events     = require("events");


function IRC(host, port, user, pass, chan) {
  this.host    = host;
  this.port    = port;
  this.user    = user;
  this.pass    = pass;
  this.chan    = chan;
  this.tcpsock = null;
}

IRC.prototype = new events.EventEmitter;

IRC.prototype.connect = function() {
  var self     = this;
  try {
    self.tcpsock = net.connect(self.port, self.host);
  } catch(err) {
    console.error("Error! failed to connect:", e);
  }

  if (self.tcpsock) {
    self.tcpsock.on('connect', function() {
      self.send('USER ' + self.user);
      if (self.pass) self.send('PASS ' + self.pass, false);
      self.send('NICK ' + self.user);

      self.emit('connected');
    });

    self.tcpsock.on('data', function(data) {
      self.emit('message', parse_irc(data.toString()));
    });

    self.tcpsock.on('close', function() {
      self.emit('disconnected');
    });

    self.tcpsock.on('error', function(err) {
      console.error("Error!", err);
    })
  }
}

IRC.prototype.join = function(channel) {
  if (channel) {
    this.chan = channel;
  }
  this.send('JOIN ' + this.chan);
  this.emit('joined');
}

IRC.prototype.send = function(text, log) {
  if (this.tcpsock) {
    try {
      this.tcpsock.write(text + '\r\n');
      if (log != false) {
        console.log('>', text);
      }
    } catch(err) {
      console.error("Error sending data:", err);
    }
  }
}

IRC.prototype.chat = function(msg) {
  this.send('PRIVMSG ' + this.chan + ' :' + msg);
}

IRC.prototype.quit = function(reason) {
  this.send('QUIT ' + (reason || ''));
}

module.exports = IRC;