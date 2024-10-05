import * as net from "net";
import * as fs from "fs/promises";

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
  socket.on("data", async (data) => {
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
    } else if (path.startsWith("/file")) {
      response = await getFile(path);
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

async function getFile(path: string): Promise<string> {
  let response = "";
  const fileName = path.split("/")[2];
  try {
    const file = await fs.stat(`/tmp/${fileName}`);

    if (!file.isFile()) {
      console.log("Not a file");
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }

    const content = await fs.readFile(`/tmp/${fileName}`, "utf-8");
    const fileSize = file.size;
    response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileSize}\r\n\r\n${content}`;
  } catch (error) {
    console.log("Error:", error);
    response = "HTTP/1.1 404 Not Found\r\n\r\n";
  }
  return response;
}
