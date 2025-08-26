import { verifyAccess } from '../utils/jwt.js';

export default function auth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = verifyAccess(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
  next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};