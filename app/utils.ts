import * as fs from "fs/promises";

export function getPath(data: string) {
  return data.split("\n")[0].split(" ")[1].trim();
}

export function getUserAgent(data: string) {
  const userAgentData = data
    .split("\n")
    .find((line) => line.startsWith("User-Agent"));
  if (!userAgentData) {
    return "";
  }
  const [, userAgent] = userAgentData.split(":");
  return userAgent.trim();
}

export function getEncoding(data: string): string | undefined {
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

export async function getFileResponse(filePath: string): Promise<string> {
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

export function getMethod(data: string) {
  return data.split("\n")[0].split(" ")[0].trim();
}
