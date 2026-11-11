import { createHmac, timingSafeEqual } from 'node:crypto';

// Changing the stored password hash automatically invalidates existing sessions.
// We compare fixed-length MACs instead of returning password hashes to clients.
export function sessionVersion(passwordHash) {
  if (!process.env.JWT_SECRET || typeof passwordHash !== 'string') throw new Error('Authentication is not configured');
  return createHmac('sha256', process.env.JWT_SECRET).update(passwordHash).digest('hex');
}
export function validSessionVersion(claim, passwordHash) {
  if (typeof claim !== 'string' || !/^[a-f0-9]{64}$/i.test(claim)) return false;
  const received=Buffer.from(claim,'hex');
  const expected=Buffer.from(sessionVersion(passwordHash),'hex');
  return timingSafeEqual(received,expected);
}
