import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let ready;

export default async function handler(req, res) {
  // Handle favicon requests
  if (req.url === '/favicon.ico' || req.url === '/favicon.png') {
    return res.status(204).end();
  }
  
  // Handle root health check
  if (req.url === '/') {
    // Let Express handle it or return simple response
    // If you want Express to handle it, skip this block
  }
  
  try {
    // Initialize DB connection once and cache it
    ready = ready || connectDB();
    await ready;
  } catch (e) {
    console.error('DB connect failed', e);
    return res.status(500).json({ error: 'DB connection failed' });
  }
  
  // Forward all requests to Express
  return app(req, res);
}