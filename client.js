var io = require('socket.io'),
connect = require('connect');
dgram = require('dgram');
PORT = 31180;
HOST = '149.171.36.211';
//const OUTGOIING_PORT;
OUTGOIING_PORT=Buffer.from('30000');
const PASSWORD_LEN = 12;
const USERNAME_LEN =14;
const PORT_LEN=2;
const LISTING_PORT=4000;
const USERNAME ='3118R0K5';
const SERV_PASSWD = '3118project'; /* password */
const outgoing = new Buffer.alloc(28,'\0','binary');
var user = {};
//code to run every minute
setInterval(function() {
  //Creating UDP port called client
  var client = dgram.createSocket('udp4');
  var offset=4;
  //Creating a listening port
  client.on('listening', function () {
    var address = client.address();
    console.log("I am listening on " + address.address + ":" + address.port);
    //console.log('UDP Server listening on ' + address.address + ":" + address.port);
  });
  var user={};

  //Received Massage from Server
  client.on('message', function (message, remote) {
    console.log(message);
    var n_user= message.readUInt32BE(0,1);
    console.log(n_user+' users: ');

    for (var i = 0; i < n_user; i++) {
      //console.log('Initail offset is:'+offset);
      var name=message.toString('utf8', offset, offset+=(USERNAME_LEN-1));
      //console.log('After name offset is:'+offset);
      var user_port=message.readIntBE(++offset, PORT_LEN);
      //console.log('After port offset is:'+offset);
      //console.log(user_port);
      var user_IP=message.readUInt8(offset+PORT_LEN,2)+'.'+message.readUInt8(offset+PORT_LEN+1,2)+'.'+message.readUInt8(offset+PORT_LEN+2,2)+'.'+message.readUInt8(offset+PORT_LEN+3,2);
      //console.log(user_IP);
      //console.log('After IP offset is:'+offset);
      user[name]={};
      user[name][user_port]=user_IP;
      offset+=6;
      //console.log('final offset is:'+offset);
    }
    for(var key in user){
      for(var p in user[key]){
        console.log('['+key+']'+' IPaddr='+user[key][p]+', port='+p+'<---');
      }
    }
  });


  //Creating datagram for registrations to Server
  //SERV_PASSWD.copy(outgoing, 0, 0, PASSWORD_LEN);
  outgoing.write(SERV_PASSWD,0,PASSWORD_LEN,'ascii');
  outgoing.write(USERNAME,PASSWORD_LEN,USERNAME_LEN,'ascii');
  outgoing.writeUIntBE(LISTING_PORT,PASSWORD_LEN+USERNAME_LEN,PORT_LEN);
  //USERNAME.copy(outgoing, PASSWORD_LEN, 0, USERNAME_LEN);
  //OUTGOIING_PORT.copy(outgoing, PASSWORD_LEN+USERNAME_LEN, 0, PORT_LEN);
  console.log(outgoing.toString('ascii', 0, 28));

  //Sending datatgram to server
  client.send(outgoing, 0, outgoing.length, PORT, HOST, function(err, bytes) {
    if (err) throw err;
    //console.log('UDP message sent to ' + HOST +':'+ PORT);
    console.log(outgoing);
  });
  //client.close();
}, 5 * 1000); // 60 * 1000 milsec


/*Things to Note
client.send() requires a proper Node.js Buffer object, not a plain string or number.
The second parameter 0, of client.send() is the offset in the buffer where the UDP packet starts.
The third parameter message.length, is the number of bytes we want to send from the offset in the buffer. In our case, the offset is 0, and the length is message.length (16 bytes), which is quite tiny and the whole buffer can be sent in a single UDP packet. This might always not be the case. For large buffers, you will need to iterate over the buffer and send it in smaller chunks of UDP packets.
Exceeding the allowed packet size will not result in any error. The packet will be silently dropped. That's just the nature of UDP.
The err object in the callback function of client.send() is going to be only of the DNS lookup kind.
Make sure the HOST / IP address is in conformance with the IP version you use, else your packets will not reach the destination.
There you go! A quick primer on getting started with UDP in Node.js.
3118project0
1st_client30

*/
