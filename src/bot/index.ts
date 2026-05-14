import { Telegraf, Context } from 'telegraf';
import { config } from '../config';
import { startHandler } from './handlers/start.handler';
import { messageHandler } from './handlers/message.handler';
import { contactHandler } from './handlers/contact.handler';
import { fileHandler } from './handlers/file.handler';
import { fallbackHandler } from './handlers/fallback.handler';

const bot = new Telegraf<Context>(config.botToken);

// /start command
bot.start(startHandler);

// Text messages
bot.on('text', messageHandler);

// Contact sharing
bot.on('contact', contactHandler);

// Photo upload
bot.on('photo', fileHandler);

// Document upload
bot.on('document', fileHandler);

// Fallback for unsupported media types (video, sticker, voice, etc.)
bot.on('video', fallbackHandler);
bot.on('sticker', fallbackHandler);
bot.on('voice', fallbackHandler);
bot.on('video_note', fallbackHandler);
bot.on('animation', fallbackHandler);
bot.on('audio', fallbackHandler);

export { bot };
