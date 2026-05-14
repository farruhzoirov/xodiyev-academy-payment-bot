import { Context } from 'telegraf';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { logMessage } from '../helpers/log-message';

export async function startHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const existing = await UserModel.findOne({ telegramId });

  // Already completed — remind and offer to upload more
  if (existing?.state === UserState.COMPLETED) {
    const replyText =
      `Salom, ${existing.fullName}! Siz allaqachon ro'yxatdan o'tgansiz ✅\n\n` +
      `Qo'shimcha to'lov screenshoti yoki PDF yubormoqchi bo'lsangiz — hoziroq yuboring.`;
    await ctx.reply(replyText, { reply_markup: { remove_keyboard: true } });
    await logMessage(telegramId, 'bot', replyText);
    return;
  }

  // In progress — remind where they left off
  if (existing?.state === UserState.WAITING_PHONE) {
    const replyText = 'Siz ro\'yxatdan o\'tish jarayonidasiz. Iltimos, telefon raqamingizni ulashing.';
    await ctx.reply(replyText, { reply_markup: { remove_keyboard: true } });
    await logMessage(telegramId, 'bot', replyText);
    return;
  }

  if (existing?.state === UserState.WAITING_PAYMENT) {
    const replyText = 'Siz ro\'yxatdan o\'tish jarayonidasiz. Iltimos, to\'lov screenshotini yoki PDF hujjatini yuboring.';
    await ctx.reply(replyText, { reply_markup: { remove_keyboard: true } });
    await logMessage(telegramId, 'bot', replyText);
    return;
  }

  // New user — start fresh
  await UserModel.findOneAndUpdate(
    { telegramId },
    {
      $set: {
        telegramId,
        username: ctx.from?.username ?? undefined,
        fullName: '',
        phoneNumber: '',
        files: [],
        state: UserState.WAITING_NAME,
        messages: [],
      },
    },
    { upsert: true, new: true },
  );

  const replyText = 'Ismingizni kiriting👇🏻';
  await ctx.reply(replyText, { reply_markup: { remove_keyboard: true } });
  await logMessage(telegramId, 'bot', replyText);
}
