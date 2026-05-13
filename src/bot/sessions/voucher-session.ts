// Tracks which users are awaiting their name input after /voucher.
// In-memory is fine — registration is a single-message exchange.
const pendingVoucher = new Set<number>();

export const voucherSession = {
  add: (telegramId: number) => pendingVoucher.add(telegramId),
  has: (telegramId: number) => pendingVoucher.has(telegramId),
  remove: (telegramId: number) => pendingVoucher.delete(telegramId),
};
