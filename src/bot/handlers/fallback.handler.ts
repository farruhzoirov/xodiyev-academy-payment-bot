import { Context } from 'telegraf';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { logMessage } from '../helpers/log-message';

export async function fallbackHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const user = await UserModel.findOne({ telegramId });
  if (!user) return;

  let replyText: string | undefined;

  switch (user.state) {
    case UserState.WAITING_NAME:
      replyText = "To'liq ismingizni yozing 👇";
      break;
    case UserState.WAITING_PHONE:
      replyText = 'Telefon raqamingizni kiriting 📱';
      break;
  }

  if (replyText) {
    await ctx.reply(replyText);
    await logMessage(telegramId, 'bot', replyText);
  }
}
