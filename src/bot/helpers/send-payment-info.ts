import path from 'path';
import { Input } from 'telegraf';
import { Context } from 'telegraf';

const ASSETS_DIR = path.resolve(process.cwd(), 'assets');

const PAYMENT_BODY =
`💳 <b>To'lov kartalari</b>

━━━━━━━━━━━━━━━━━━━━
💰 <b>Tariflar:</b>
• Standart — <b>449 000 so'm</b>
• Premium — <b>899 000 so'm</b>
━━━━━━━━━━━━━━━━━━━━

🏦 <b>Karta raqamlari</b> <i>(bosib nusxa oling):</i>
<code>5614 6812 8102 6314</code>
<code>5614 6812 5943 3831</code>
👤 XODIYEV LUTFULLOXON

━━━━━━━━━━━━━━━━━━━━
📌 <b>Diqqat!</b> To'lov qilganingizdan so'ng, to'lov chekini shu botga yuborishni unutmang!`;

export async function sendPaymentInfo(ctx: Context, header?: string): Promise<void> {
  const caption = header ? `${header}\n\n${PAYMENT_BODY}` : PAYMENT_BODY;

  await ctx.replyWithMediaGroup([
    {
      type: 'photo',
      media: Input.fromLocalFile(path.join(ASSETS_DIR, 'card1.jpg')),
    },
    {
      type: 'photo',
      media: Input.fromLocalFile(path.join(ASSETS_DIR, 'card2.jpg')),
      caption,
      parse_mode: 'HTML',
    },
  ]);
}
