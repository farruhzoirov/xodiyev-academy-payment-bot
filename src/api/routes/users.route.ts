import { Router, Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { UserState } from "../../types";

const router = Router();

router.get(
  "/random-user",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const todaysUsers = await UserModel.find(
        {
          state: UserState.COMPLETED,
          "files.0": { $exists: true },
        },
        { fullName: 1, phoneNumber: 1, files: 1, _id: 0 },
      );

      const eligibleUsers = todaysUsers.filter((u) => u.files.length > 0);

      if (eligibleUsers.length === 0) {
        res
          .status(404)
          .json({ message: "Bugun hali hech kim to'lov qilmagan." });
        return;
      }

      const randomIndex = Math.floor(Math.random() * eligibleUsers.length);
      const user = eligibleUsers[randomIndex];

      res.json({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        files: user.files.map((f) => ({
          path: f.path,
          type: f.type,
          uploadedAt: f.uploadedAt,
        })),
      });
    } catch (err) {
      console.error("Error fetching random user:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  },
);

export { router as usersRouter };
