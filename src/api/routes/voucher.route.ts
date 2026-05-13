import { Router, Request, Response } from "express";
import { VoucherParticipantModel } from "../../models/voucher.model";

const router = Router();

router.get(
  "/random-user",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todaysParticipants = await VoucherParticipantModel.find(
        {
          registeredAt: { $gte: todayStart, $lte: todayEnd },
          fullName: { $exists: true, $ne: "" },
          phoneNumber: { $exists: true, $ne: "" },
        },
        { fullName: 1, phoneNumber: 1, _id: 0 },
      );

      if (todaysParticipants.length === 0) {
        res.status(404).json({
          message: "Bugun hali hech kim voucher o'yiniga ro'yxatdan o'tmagan.",
        });
        return;
      }

      const randomIndex = Math.floor(Math.random() * todaysParticipants.length);
      const winner = todaysParticipants[randomIndex];

      res.json({ fullName: winner.fullName, phone: winner.phoneNumber });
    } catch (err) {
      console.error("Error fetching random voucher participant:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  },
);

export { router as voucherRouter };
