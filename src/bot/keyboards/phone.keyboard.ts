import { Markup } from 'telegraf';

export function phoneKeyboard() {
  return Markup.keyboard([
    [Markup.button.contactRequest('📱 Telefon raqamni ulashish')],
  ])
    .oneTime()
    .resize();
}
