import dotenv from 'dotenv';

dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN!,
  mongoUri: process.env.MONGO_URI!,
  apiPort: Number(process.env.API_PORT) || 3000,
  telegramApiBase: 'https://api.telegram.org',
};
