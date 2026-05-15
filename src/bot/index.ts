import { Telegraf, Context } from 'telegraf';
import { config } from '../config';
import { startHandler } from './handlers/start.handler';
import { messageHandler } from './handlers/message.handler';
import { contactHandler } from './handlers/contact.handler';
import { fallbackHandler } from './handlers/fallback.handler';

const bot = new Telegraf<Context>(config.botToken);

bot.start(startHandler);

bot.on('text', messageHandler);

bot.on('contact', contactHandler);

bot.on('photo', fallbackHandler);
bot.on('document', fallbackHandler);
bot.on('video', fallbackHandler);
bot.on('sticker', fallbackHandler);
bot.on('voice', fallbackHandler);
bot.on('video_note', fallbackHandler);
bot.on('animation', fallbackHandler);
bot.on('audio', fallbackHandler);

export { bot };
