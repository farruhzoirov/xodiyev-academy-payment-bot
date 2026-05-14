import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { phoneKeyboard } from '../keyboards/phone.keyboard';
import { logMessage } from '../helpers/log-message';
import { sendPaymentInfo } from '../helpers/send-payment-info';

export async function messageHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const msg = ctx.message as Message.TextMessage | undefined;
  if (!msg || !('text' in msg)) return;

  const text = msg.text.trim();

  await logMessage(telegramId, 'user', text);

  let user = await UserModel.findOne({ telegramId });

  if (!user) {
    user = await UserModel.create({
      telegramId,
      username: ctx.from?.username,
      state: UserState.WAITING_NAME,
    });
    const replyText = 'Boshlash uchun /start yuboring.';
    await ctx.reply(replyText);
    await logMessage(telegramId, 'bot', replyText);
    return;
  }

  switch (user.state) {
    case UserState.WAITING_NAME: {
      await UserModel.findOneAndUpdate(
        { telegramId },
        { $set: { fullName: text, state: UserState.WAITING_PHONE } },
      );

      const replyText = 'Telefon raqamingizni kiriting 📱';
      await ctx.reply(replyText, phoneKeyboard());
      await logMessage(telegramId, 'bot', replyText);
      break;
    }

    case UserState.WAITING_PHONE: {
      const digits = text.replace(/\D/g, '');

      if (digits.length < 9) {
        const replyText = 'Telefon raqamingizni kiriting 📱';
        await ctx.reply(replyText);
        await logMessage(telegramId, 'bot', replyText);
        break;
      }

      const existingWithPhone = await UserModel.findOne({
        phoneNumber: text,
        telegramId: { $ne: telegramId },
      });

      if (existingWithPhone) {
        const replyText = "Bu telefon raqam allaqachon ro'yxatdan o'tgan. Iltimos, boshqa raqam bilan /start bosing.";
        await ctx.reply(replyText, { reply_markup: { remove_keyboard: true } });
        await logMessage(telegramId, 'bot', replyText);
        break;
      }

      await UserModel.findOneAndUpdate(
        { telegramId },
        { $set: { phoneNumber: text, state: UserState.WAITING_PAYMENT } },
      );

      await sendPaymentInfo(ctx);
      await logMessage(telegramId, 'bot', '[payment info sent]');
      break;
    }

    case UserState.WAITING_PAYMENT: {
      const replyText =
        "Iltimos, to'lov screenshotini yoki PDF chekini yuboring.";
      await ctx.reply(replyText);
      await logMessage(telegramId, 'bot', replyText);
      break;
    }

    case UserState.COMPLETED: {
      const replyText =
        "Siz allaqachon ro'yxatdan o'tgansiz. Qaytadan boshlash uchun /start yuboring.";
      await ctx.reply(replyText);
      await logMessage(telegramId, 'bot', replyText);
      break;
    }

    default: {
      const replyText = 'Boshlash uchun /start yuboring.';
      await ctx.reply(replyText);
      await logMessage(telegramId, 'bot', replyText);
    }
  }
}
