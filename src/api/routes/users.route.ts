import { Router, Request, Response } from 'express';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';

const router = Router();

router.get('/random-user', async (_req: Request, res: Response): Promise<void> => {
  try {
    const completedUsers = await UserModel.find(
      { state: UserState.COMPLETED },
      { fullName: 1, phoneNumber: 1, filePath: 1, fileType: 1, _id: 0 },
    );

    if (completedUsers.length === 0) {
      res.status(404).json({ message: 'No completed users found.' });
      return;
    }

    const randomIndex = Math.floor(Math.random() * completedUsers.length);
    const user = completedUsers[randomIndex];

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
