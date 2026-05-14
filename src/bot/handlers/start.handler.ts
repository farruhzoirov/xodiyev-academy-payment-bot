import { Context } from 'telegraf';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { logMessage } from '../helpers/log-message';
import { sendPaymentInfo } from '../helpers/send-payment-info';

export async function startHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const existing = await UserModel.findOne({ telegramId });

  // Already completed — send payment info again
  if (existing?.state === UserState.COMPLETED) {
    await sendPaymentInfo(ctx);
    await logMessage(telegramId, 'bot', '[payment info sent]');
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
