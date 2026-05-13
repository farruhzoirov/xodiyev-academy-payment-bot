import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { VoucherParticipantModel } from '../../models/voucher.model';
import { voucherSession } from '../sessions/voucher-session';
import { phoneKeyboard } from '../keyboards/phone.keyboard';

export async function voucherCommandHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  voucherSession.set(telegramId, 'WAITING_NAME');
  await ctx.reply(
    'Voucher o\'yinida ishtirok etish uchun to\'liq ism familiyangizni yuboring.',
    { reply_markup: { remove_keyboard: true } },
  );
}

export async function voucherNameHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const msg = ctx.message as Message.TextMessage | undefined;
  if (!msg || !('text' in msg)) return;

  const fullName = msg.text.trim();

  await VoucherParticipantModel.findOneAndUpdate(
    { telegramId },
    { $set: { telegramId, username: ctx.from?.username, fullName } },
    { upsert: true },
  );

  voucherSession.set(telegramId, 'WAITING_PHONE');

  const replyText = `Rahmat, ${fullName}! Endi telefon raqamingizni ulashing.`;
  await ctx.reply(replyText, phoneKeyboard());
}

export async function voucherContactHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const msg = ctx.message as Message.ContactMessage | undefined;
  if (!msg || !('contact' in msg)) return;

  const phoneNumber = msg.contact.phone_number;

  voucherSession.remove(telegramId);

  await VoucherParticipantModel.findOneAndUpdate(
    { telegramId },
    { $set: { phoneNumber, registeredAt: new Date() } },
  );

  await ctx.reply(
    '✅ Tabriklaymiz! Siz voucher o\'yiniga muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
    { reply_markup: { remove_keyboard: true } },
  );
}
