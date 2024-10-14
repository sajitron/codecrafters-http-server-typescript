import * as net from "net";
import * as fs from "fs/promises";
import * as path from "node:path";

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
    const requestPath = getPath(data.toString());
    let response = "";
    const encoding = getEncoding(data.toString());
    if (requestPath === "/") {
      response = `HTTP/1.1 200 OK${
        encoding ? `\r\nContent-Encoding: ${encoding}` : ""
      }\r\n\r\n`;
    } else if (requestPath.startsWith("/echo")) {
      const param = requestPath.slice(6);
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain${
        encoding ? `\r\nContent-Encoding: ${encoding}` : ""
      }\r\nContent-Length: ${param.length}\r\n\r\n${param}`;
    } else if (requestPath.startsWith("/user-agent")) {
      const userAgent = getUserAgent(data.toString());
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain${
        encoding ? `\r\nContent-Encoding: ${encoding}` : ""
      }\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
    } else if (requestPath.startsWith("/files")) {
      const requestMethod = getMethod(data.toString());
      const directory = process.argv[3];
      const fileName = requestPath.split("/")[2];
      const filePath = `${directory}/${fileName}`;
      if (requestMethod === "GET") {
        response = await getFileResponse(filePath);
      } else if (requestMethod === "POST") {
        const requestBody = data.toString().split("\r\n\r\n")[1].trim();
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, requestBody);
        response = "HTTP/1.1 201 Created\r\n\r\n";
      } else {
        response = "HTTP/1.1 405 Method Not Allowed\r\n\r\n";
      }
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
  const userAgentData = data
    .split("\n")
    .find((line) => line.startsWith("User-Agent"));
  if (!userAgentData) {
    return "";
  }
  const [, userAgent] = userAgentData.split(":");
  return userAgent.trim();
}

function getEncoding(data: string): string | undefined {
  const encodingData = data
    .split("\n")
    .find((line) => line.startsWith("Accept-Encoding"));
  if (!encodingData) {
    return undefined;
  }
  const encoding = encodingData.split(":")[1].trim();
  const encodingSchemes = [
    "gzip",
    "deflate",
    "exi",
    "identity",
    "pack200-gzip",
    "br",
    "compress",
    "zstd",
  ];
  const firstFoundScheme = encoding
    .split(",")
    .find((scheme) => encodingSchemes.includes(scheme.trim()));
  return firstFoundScheme;
}

async function getFileResponse(filePath: string): Promise<string> {
  let response = "";
  try {
    const file = await fs.stat(filePath);

    if (!file.isFile()) {
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }

    const content = await fs.readFile(filePath, "utf-8");
    const fileSize = file.size;
    response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileSize}\r\n\r\n${content}`;
  } catch (error) {
    console.log("Error Block:", error);
    response = "HTTP/1.1 404 Not Found\r\n\r\n";
  }
  return response;
}

function getMethod(data: string) {
  return data.split("\n")[0].split(" ")[0].trim();
}
