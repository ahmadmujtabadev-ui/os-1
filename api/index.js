import app from '../src/app.js';
import { connectDB } from '../src/config/db.js'; // adjust path to your connect function

let ready;
export default async function handler(req, res) {
  try {
    ready = ready || connectDB();
    await ready;           // cached after first hit
  } catch (e) {
    console.error('DB connect failed', e);
    res.status(500).json({ error: 'DB connection failed' });
    return;
  }
  return app(req, res);    // forward to Express
}
