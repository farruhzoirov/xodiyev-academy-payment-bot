import path from 'path';
import express from 'express';
import { usersRouter } from './routes/users.route';
import { voucherRouter } from './routes/voucher.route';

const app = express();

app.use(express.json());

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api/tablet', usersRouter);
app.use('/api/voucher', voucherRouter);

export { app };
