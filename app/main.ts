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
  socket.on("data", (data) => {
    const path = getPath(data.toString());
    let response = "";
    if (path === "/") {
      response = "HTTP/1.1 200 OK\r\n\r\n";
    } else if (path.startsWith("/echo")) {
      const param = path.slice(6);
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${param.length}\r\n\r\n${param}`;
    } else if (path.startsWith("/user-agent")) {
      const userAgent = getUserAgent(data.toString());
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
    } else {
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }
    socket.write(response, () => {
      console.log("Response sent", response);
    });
    socket.pipe(socket);
  });
});

server.listen(4221, "localhost");

function getPath(data: string) {
  return data.split("\n")[0].split(" ")[1].trim();
}

function getUserAgent(data: string) {
  return data.split("\n")[2].split(" ")[1].trim();
}
