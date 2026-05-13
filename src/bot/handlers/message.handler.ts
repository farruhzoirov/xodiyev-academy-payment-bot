import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { phoneKeyboard } from '../keyboards/phone.keyboard';
import { logMessage } from '../helpers/log-message';

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

      const replyText = `Tanishganimdan xursandman, ${text}! Iltimos, quyidagi tugma orqali telefon raqamingizni ulashing.`;
      await ctx.reply(replyText, phoneKeyboard());
      await logMessage(telegramId, 'bot', replyText);
      break;
    }

    case UserState.WAITING_PHONE: {
      const replyText =
        'Iltimos, "📱 Telefon raqamni ulashish" tugmasini bosing.';
      await ctx.reply(replyText);
      await logMessage(telegramId, 'bot', replyText);
      break;
    }

    case UserState.WAITING_PAYMENT: {
      const replyText =
        'Iltimos, to\'lov screenshotini yoki PDF hujjatini yuboring.';
      await ctx.reply(replyText);
      await logMessage(telegramId, 'bot', replyText);
      break;
    }

    case UserState.COMPLETED: {
      const replyText =
        'Rahmat! To\'lovingiz qabul qilindi. Qaytadan boshlash uchun /start yuboring.';
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
