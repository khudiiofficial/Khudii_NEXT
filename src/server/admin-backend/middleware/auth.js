import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const token = req.cookies.token;
  const secret = process.env.JWT_SECRET;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  if (!secret) return res.status(500).json({ message: 'JWT secret is not configured' });

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
