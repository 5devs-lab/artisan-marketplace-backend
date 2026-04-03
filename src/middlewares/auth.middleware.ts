import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth.js';
import { User } from '../features/user/user.model.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    const payload = await auth.verifyToken(token, 'access');
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }

    // Kroxt returns the payload with 'sub' as user ID. 
    // We fetch the full user from DB for req.user convenience.
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
};
