import { Context } from 'telegraf';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { logMessage } from '../helpers/log-message';

export async function startHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const username = ctx.from?.username;

  await UserModel.findOneAndUpdate(
    { telegramId },
    {
      $set: {
        telegramId,
        username: username ?? undefined,
        fullName: '',
        phoneNumber: '',
        filePath: '',
        state: UserState.WAITING_NAME,
        messages: [],
      },
    },
    { upsert: true, new: true },
  );

  const replyText = 'Xush kelibsiz! Iltimos, to\'liq ism familiyangizni yuboring.';
  await ctx.reply(replyText, { reply_markup: { remove_keyboard: true } });
  await logMessage(telegramId, 'bot', replyText);
}
