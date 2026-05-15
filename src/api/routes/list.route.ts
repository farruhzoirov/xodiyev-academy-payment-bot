import { Router, Request, Response } from 'express';
import { UserModel } from '../../models/user.model';

const router = Router();

router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(
        {},
        {
          _id: 0,
          telegramId: 0,
          username: 0,
          messages: 0,
          files: 0,
        },
      )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(),
    ]);

    res.json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching users list:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export { router as listRouter };
