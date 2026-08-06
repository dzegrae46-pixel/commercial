const { createServer } = require("node:http");
const next = require("next");

process.chdir(__dirname);

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const nextApplication = next({
  dev: false,
  dir: __dirname,
  hostname: "0.0.0.0",
  port,
});
const handleRequest = nextApplication.getRequestHandler();

nextApplication.prepare().then(() => {
  const server = createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      console.error("Unhandled Next.js request error:", error);
      if (!response.headersSent) response.statusCode = 500;
      if (!response.writableEnded) response.end("Internal Server Error");
    });
  });

  server.on("error", (error) => {
    console.error("Unable to start the Next.js server:", error);
    process.exitCode = 1;
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`Commercial is listening on port ${port}.`);
  });
}).catch((error) => {
  console.error("Unable to prepare Commercial:", error);
  process.exitCode = 1;
});
