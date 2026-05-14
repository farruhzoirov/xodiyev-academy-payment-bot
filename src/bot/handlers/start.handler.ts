import { Context } from 'telegraf';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { logMessage } from '../helpers/log-message';

export async function startHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  // Always reset to the beginning
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

  const replyText = 'Ismingizni yozing 👇';
  await ctx.reply(replyText, { reply_markup: { remove_keyboard: true } });
  await logMessage(telegramId, 'bot', replyText);
}
