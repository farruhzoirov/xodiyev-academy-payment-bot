import "dotenv/config";
import mongoose from "mongoose";
import { config } from "./config";
import { bot } from "./bot";
import { app } from "./api/server";

async function main(): Promise<void> {
  // Connect to MongoDB
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");

  // Start Express API
  app.listen(config.apiPort, () => {
    console.log(`API server running on port ${config.apiPort}`);
  });

  // Start Telegram bot (non-blocking in polling mode)
  bot.launch().catch((err) => {
    console.error("Bot error:", err);
    process.exit(1);
  });
  console.log("Telegram bot started");

  // Graceful shutdown
  process.once("SIGINT", () => {
    bot.stop("SIGINT");
    mongoose.connection.close().catch(console.error);
  });
  process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
    mongoose.connection.close().catch(console.error);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
