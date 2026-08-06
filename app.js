import { createServer } from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import next from "next";

const applicationRoot = dirname(fileURLToPath(import.meta.url));
process.chdir(applicationRoot);

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const dev = process.env.NODE_ENV !== "production";
const nextApplication = next({
  dev,
  dir: applicationRoot,
  hostname: "0.0.0.0",
  port,
});
const handleRequest = nextApplication.getRequestHandler();

nextApplication.prepare().then(() => {
  const server = createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      console.error("Unhandled Next.js request error:", error);

      if (!response.headersSent) {
        response.statusCode = 500;
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
      }

      if (!response.writableEnded) response.end("Internal Server Error");
    });
  });

  server.on("error", (error) => {
    console.error("Unable to start the Next.js server:", error);
    process.exitCode = 1;
  });

  server.listen(port, () => {
    console.log(`Commercial is listening on port ${port}.`);
  });
}).catch((error) => {
  console.error("Unable to prepare Commercial:", error);
  process.exitCode = 1;
});
