var net        = require('net');
var config     = require('./config.js')
/*
  // config.js
  config = {
    host: 'irc.twitch.tv',
    port: 6667,
    user: 'yourTwitchUserName',
    pass: 'see www.twitchapps.com/tmi/',
    chan: '#YourChannelName'
  }
  module.exports = config;
*/
var parse_irc  = require('irc-message');
var websock    = require('ws').Server

var ws         = new websock({port: 2048});

console.log("waiting for browser to connect...")
ws.on('connection', function(ws) {
  console.log('Browser connected!');

  var tcpsock = net.connect(config.port, config.host);
  tcpsock.on('connect', function() {
    tcpsock.write('USER ' + config.user + '\n');
    tcpsock.write('PASS ' + config.pass + '\n');
    tcpsock.write('NICK ' + config.user + '\n');
    tcpsock.write('JOIN ' + config.chan + '\n');

    console.log('IRC connection established!')
  });

  tcpsock.on('data', function(data) {
    try {
      var msg = parse_irc(data.toString());
      if (msg && msg['command'] == 'PRIVMSG' && msg['params'].length == 2 && msg['params'][0].toLowerCase() == config.chan.toLowerCase()) {
        switch(msg['params'][1].toLowerCase()) {
          case 'up\r\n':
            console.log('up');
            ws.send("0");
            break;
          case 'down\r\n':
            console.log('down');
            ws.send("2");
            break;
          case 'left\r\n':
            console.log('left');
            ws.send("3");
            break;
          case 'right\r\n':
            console.log('right');
            ws.send("1");
            break;
          case 'restart\r\n':
            console.log('restart');
            ws.send("4");
            break;
        }
      }
    } catch(err) {
      console.log(err);
    }
  });

  tcpsock.on('close', function() {
    console.log('IRC disconnected!');
  });
});