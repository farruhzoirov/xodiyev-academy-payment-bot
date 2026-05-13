import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { logMessage } from '../helpers/log-message';

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

  await UserModel.findOneAndUpdate(
    { telegramId },
    { $set: { phoneNumber, state: UserState.WAITING_PAYMENT } },
  );

  const replyText =
    'Rahmat! Endi to\'lov screenshotini (rasm) yoki PDF hujjatini yuboring.';
  await ctx.reply(replyText, { reply_markup: { remove_keyboard: true } });
  await logMessage(telegramId, 'bot', replyText);
}
