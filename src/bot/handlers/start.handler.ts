import { Context } from 'telegraf';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { logMessage } from '../helpers/log-message';
import { sendPaymentInfo } from '../helpers/send-payment-info';

export async function startHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const existing = await UserModel.findOne({ telegramId });

  // Already completed — remind and resend payment info
  if (existing?.state === UserState.COMPLETED) {
    const header = `✅ <b>Siz allaqachon ro'yxatdan o'tgansiz!</b>\n\nQo'shimcha to'lov screenshoti yubormoqchi bo'lsangiz — quyidagi kartalardan biriga to'lov qiling va chekni yuboring.`;
    await sendPaymentInfo(ctx, header);
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
    await sendPaymentInfo(ctx);
    await logMessage(telegramId, 'bot', '[payment info sent]');
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
