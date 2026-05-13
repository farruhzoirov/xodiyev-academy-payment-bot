import { Router, Request, Response } from 'express';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';

const router = Router();

router.get('/random-user', async (_req: Request, res: Response): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysUsers = await UserModel.find(
      {
        state: UserState.COMPLETED,
        completedAt: { $gte: todayStart, $lte: todayEnd },
      },
      { fullName: 1, phoneNumber: 1, filePath: 1, fileType: 1, _id: 0 },
    );

    if (todaysUsers.length === 0) {
      res.status(404).json({ message: 'Bugun hali hech kim to\'lov qilmagan.' });
      return;
    }

    const randomIndex = Math.floor(Math.random() * todaysUsers.length);
    const user = todaysUsers[randomIndex];

    res.json({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      filePath: user.filePath,
      fileType: user.fileType,
    });
  } catch (err) {
    console.error('Error fetching random user:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export { router as usersRouter };
