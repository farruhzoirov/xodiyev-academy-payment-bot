type VoucherStep = 'WAITING_NAME' | 'WAITING_PHONE';

const pending = new Map<number, VoucherStep>();

export const voucherSession = {
  set: (telegramId: number, step: VoucherStep) => pending.set(telegramId, step),
  get: (telegramId: number) => pending.get(telegramId),
  has: (telegramId: number) => pending.has(telegramId),
  remove: (telegramId: number) => pending.delete(telegramId),
};
