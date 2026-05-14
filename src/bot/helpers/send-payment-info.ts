import path from 'path';
import { Input } from 'telegraf';
import { Context } from 'telegraf';

const ASSETS_DIR = path.resolve(process.cwd(), 'assets');

const PAYMENT_TEXT = `💳 *To'lov rekvizitlari*

📦 *Tariflar:*
• Standart — 449,000 so'm
• Premium — 899,000 so'm

💳 *Karta raqamlari:*
\`5614 6812 8102 6314\` — XODIYEV LUTFULLOXON
\`5614 6812 5943 3831\` — XODIYEV LUTFULLOXON

⚠️ To'lov qilganingizdan so'ng, to'lov chekini shu botga yuborishni unutmang\\!`;

export async function sendPaymentInfo(ctx: Context): Promise<void> {
  await ctx.replyWithMediaGroup([
    {
      type: 'photo',
      media: Input.fromLocalFile(path.join(ASSETS_DIR, 'card1.jpg')),
    },
    {
      type: 'photo',
      media: Input.fromLocalFile(path.join(ASSETS_DIR, 'card2.jpg')),
    },
  ]);

  await ctx.reply(PAYMENT_TEXT, { parse_mode: 'MarkdownV2' });
}
