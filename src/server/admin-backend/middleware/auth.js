import jwt from 'jsonwebtoken';
import db from '../Database/oldDB.js';
import { validSessionVersion } from '../utils/sessionVersion.js';

export const auth = async (req, res, next) => {
  const token = req.cookies?.token;
  const secret = process.env.JWT_SECRET;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  if (!secret) return res.status(503).json({ message: 'Authentication is not configured' });

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
    if (!decoded?.id || !decoded?.sessionVersion) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    const [users] = await db.promise().query(
      'SELECT id, email, password, status, deleted_at FROM users WHERE id = ? LIMIT 1',
      [decoded.id],
    );
    const user = users[0];
    if (!user || !user.status || user.deleted_at || !validSessionVersion(decoded.sessionVersion, user.password) || decoded.email !== user.email) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    req.user = { id: user.id, email: user.email };
    return next();
  } catch (error) {
    console.error('[Khudii auth] Database validation failed:', error?.code || error?.message);
    return res.status(503).json({ message: 'Authentication service temporarily unavailable' });
  }
};
