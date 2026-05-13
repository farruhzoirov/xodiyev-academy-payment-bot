import { Telegraf, Context } from 'telegraf';
import { config } from '../config';
import { startHandler } from './handlers/start.handler';
import { messageHandler } from './handlers/message.handler';
import { contactHandler } from './handlers/contact.handler';
import { fileHandler } from './handlers/file.handler';
import { voucherCommandHandler } from './handlers/voucher.handler';

const bot = new Telegraf<Context>(config.botToken);

// /start command
bot.start(startHandler);

// /voucher command — day 3 voucher game registration
bot.command('voucher', voucherCommandHandler);

// Text messages (voucher name input is checked first inside this handler)
bot.on('text', messageHandler);

// Contact sharing
bot.on('contact', contactHandler);

// Photo upload
bot.on('photo', fileHandler);

// Document upload
bot.on('document', fileHandler);

export { bot };
