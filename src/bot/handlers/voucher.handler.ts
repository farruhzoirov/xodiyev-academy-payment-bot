import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { VoucherParticipantModel } from '../../models/voucher.model';
import { voucherSession } from '../sessions/voucher-session';

export async function voucherCommandHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  voucherSession.add(telegramId);
  await ctx.reply('Voucher o\'yinida ishtirok etish uchun to\'liq ism familiyangizni yuboring.');
}

export async function voucherNameHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const msg = ctx.message as Message.TextMessage | undefined;
  if (!msg || !('text' in msg)) return;

  const fullName = msg.text.trim();

  voucherSession.remove(telegramId);

  await VoucherParticipantModel.findOneAndUpdate(
    { telegramId },
    {
      $set: {
        telegramId,
        username: ctx.from?.username,
        fullName,
        registeredAt: new Date(),
      },
    },
    { upsert: true },
  );

  await ctx.reply(`✅ ${fullName}, siz voucher o\'yiniga muvaffaqiyatli ro\'yxatdan o\'tdingiz!`);
}
