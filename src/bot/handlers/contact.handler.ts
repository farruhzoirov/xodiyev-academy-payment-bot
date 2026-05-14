import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { logMessage } from '../helpers/log-message';
import { sendPaymentInfo } from '../helpers/send-payment-info';

export async function contactHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const msg = ctx.message as Message.ContactMessage | undefined;
  if (!msg || !('contact' in msg)) return;

  const phoneNumber = msg.contact.phone_number;

  await logMessage(telegramId, 'user', `[contact shared: ${phoneNumber}]`);

  const user = await UserModel.findOne({ telegramId });

  if (!user || user.state !== UserState.WAITING_PHONE) {
    const replyText = 'Boshlash uchun /start yuboring.';
    await ctx.reply(replyText, { reply_markup: { remove_keyboard: true } });
    await logMessage(telegramId, 'bot', replyText);
    return;
  }

  // Check if this phone number is already used by another user
  const existingWithPhone = await UserModel.findOne({
    phoneNumber,
    telegramId: { $ne: telegramId },
  });

  if (existingWithPhone) {
    const replyText = 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan. Iltimos, boshqa raqam bilan /start bosing.';
    await ctx.reply(replyText, { reply_markup: { remove_keyboard: true } });
    await logMessage(telegramId, 'bot', replyText);
    return;
  }

  await UserModel.findOneAndUpdate(
    { telegramId },
    { $set: { phoneNumber, state: UserState.WAITING_PAYMENT } },
  );

  await sendPaymentInfo(ctx);

  await logMessage(telegramId, 'bot', '[payment info sent]');
}
