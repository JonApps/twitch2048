var websock    = require('ws').Server;
var config     = require('./config.js');
var IRC        = require('./irc.js');

var ws         = new websock({port: 2048});
var asock      = null;

function cmd (command) {
  if (asock) {
    try {
      asock.send(command);
    } catch(err) {
      console.error("Error! Couldn't send command to websocket:", err);
    }
  } else {
    console.error("Error! Tried to send command to websocket, but no websocket is available");
  }
}

ws.on('connection', function(sock) {
  asock = sock;
  console.log('Browser connected! (' + sock.upgradeReq.headers['user-agent'] + ')');
  //twitch_irc.chat('\x01ACTION INFO: Connection to browser established; Listening to commands\x01')

  sock.on('close', function() {
    console.log('Browser disconnected! (' + sock.upgradeReq.headers['user-agent'] + ')');
    twitch_irc.chat('\x01ACTION INFO: Lost connection to browser\x01')
  })
});

var twitch_irc = new IRC(config.host, config.port, config.user, config.pass, config.chan)

twitch_irc.on('connected', function() {
  console.log('connected to twitch: ' + config.user + ', ' + config.chan);
  twitch_irc.join();
})

twitch_irc.on('joined', function() {
  console.log('joined channel: ' + twitch_irc.chan);
  twitch_irc.chat('\x01ACTION INFO: Server started\x01');
})

twitch_irc.on('message', function(data) {
  if (data &&
      data['command'] == 'PRIVMSG' &&
      data['params'].length == 2 &&
      data['params'][0].toLowerCase() == config.chan.toLowerCase()
  ) {
    switch(data['params'][1].toLowerCase()) {
      case 'up\r\n':
        console.log('up');
        cmd("0");
        break;
      case 'down\r\n':
        console.log('down');
        cmd("2");
        break;
      case 'left\r\n':
        console.log('left');
        cmd("3");
        break;
      case 'right\r\n':
        console.log('right');
        cmd("1");
        break;
      case 'restart\r\n':
        console.log('restart');
        cmd("4");
        break;
    }
  }
})

twitch_irc.on('disconnected', function() {
  console.log('lost connection to twitch irc! Trying to reconnect in ' + (config.reconnect_timeout/1000) + ' seconds ...');
  setTimeout(function() {
    try {
      twitch_irc.connect();
    } catch(e) {
      console.log('failed to reconnect:', e);
    }
  }, config.reconnect_timeout);
})

process.on('SIGINT', function() {
  console.log('Shutting down..');
  twitch_irc.chat('\x01ACTION INFO: Server stopped\x01');
  twitch_irc.quit('Server stopped');
  process.exit();
})

twitch_irc.connect();