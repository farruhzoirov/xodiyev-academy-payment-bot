import express from 'express';
import { usersRouter } from './routes/users.route';

const app = express();

app.use(express.json());

app.use('/api', usersRouter);

export { app };
