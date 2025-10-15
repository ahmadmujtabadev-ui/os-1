import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let dbConnection;

export default async function handler(req, res) {
  // Handle favicon requests early
  if (req.url?.includes('favicon')) {
    return res.status(204).end();
  }

  try {
    // Connect to DB once and reuse connection
    if (!dbConnection) {
      dbConnection = connectDB();
    }
    await dbConnection;
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }

  // Let Express handle the request
  return app(req, res);
}