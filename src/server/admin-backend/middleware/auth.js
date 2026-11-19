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
    let users;
    try {
      [users] = await db.promise().query(
        'SELECT id, name, email, role, badge_bg, badge_text_color, password, status, deleted_at FROM users WHERE id = ? LIMIT 1',
        [decoded.id],
      );
    } catch (colErr) {
      if (colErr?.code === 'ER_BAD_FIELD_ERROR') {
        [users] = await db.promise().query(
          'SELECT id, email, password, status, deleted_at FROM users WHERE id = ? LIMIT 1',
          [decoded.id],
        );
      } else {
        throw colErr;
      }
    }
    const user = users[0];
    if (!user || !user.status || user.deleted_at || !validSessionVersion(decoded.sessionVersion, user.password) || decoded.email !== user.email) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || user.email?.split('@')[0] || 'Admin',
      role: user.role || 'admin',
      badge_bg: user.badge_bg || null,
      badge_text_color: user.badge_text_color || null,
    };
    return next();
  } catch (error) {
    console.error('[Khudii auth] Database validation failed:', error?.code || error?.message);
    return res.status(503).json({ message: 'Authentication service temporarily unavailable' });
  }
};
