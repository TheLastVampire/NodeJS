// Load the TCP Library
net = require('net');

// Keep track of the chat clients
var clients = [];

var joinStr = new RegExp('^join[ ][a-zA-Z0-9_]+');

// Start a TCP Server
net.createServer(function (socket) {

    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort

    socket.buffer = '';
    socket.isJoined = false;

    // Put this new client in the list
    clients.push(socket);

    // Send a nice welcome message and announce
    socket.write('Welcome! Please enter "join <alias>" to continue. If ur alias is "god", enter "join god" without quotes and PRESS Enter.\n');

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
        socket.buffer += data;

        if (socket.buffer.indexOf('\n') > 0) {
            socket.buffer.trim();
            if (socket.isJoined) {
                broadcast(socket.name + "> " + socket.buffer, socket);
                socket.buffer = '';
            }
            else {
                if (joinStr.test(socket.buffer)) {
                    socket.isJoined = true;
                    socket.name = socket.buffer.substring(5).trim();
                    broadcast(socket.name + " joined the chat\n", socket);
                    socket.write('You may chat now!\n');
                }
                else {
                    socket.write('Incorrect registration string.\n');
                }
                socket.buffer = '';
            }
            
        }
        
    });

    // Remove the client from the list when it leaves
    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        broadcast(socket.name + " left the chat.\n");
    });

    // Send a message to all clients
    function broadcast(message, sender) {
        clients.forEach(function (client) {
            // Don't want to send it to sender
            if (client === sender) return;
            client.write(message);
        });
        // Log it to the server output too
        process.stdout.write(message)
    }

}).listen(4000);

// Put a friendly message on the terminal of the server.
console.log("Server running at port 4000\n");