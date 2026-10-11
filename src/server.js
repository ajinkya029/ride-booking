require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const port = Number(process.env.PORT || 5000);

async function start() {
  await connectDB();
  const server = app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  const shutdown = (signal) => {
    console.log(`${signal} received; closing server`);
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
