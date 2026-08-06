import("./app.js").catch((error) => {
  console.error("Unable to start Commercial:", error);
  process.exitCode = 1;
});
