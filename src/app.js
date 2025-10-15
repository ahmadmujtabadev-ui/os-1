// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(routes);
app.use(errorHandler);
app.get(['/favicon.ico', '/favicon.png'], (_req, res) => res.sendStatus(204));


export default app;
