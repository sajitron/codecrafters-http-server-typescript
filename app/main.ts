import { createServer } from "./server";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = createServer();

server.listen(4221, "localhost");
