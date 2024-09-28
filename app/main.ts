import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("connect", () => {
    console.log("Client connected");
  });
  socket.on("close", () => {
    socket.end();
  });
  socket.write("HTTP/1.1 200 OK\r\n\r\n");
  socket.pipe(socket);
});

server.listen(4221, "localhost");
