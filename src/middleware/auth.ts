import type { Request, Response, NextFunction } from 'express';
import { verifyFirebaseIdToken } from '../lib/firebase-admin';

export interface AuthenticatedRequest extends Request {
  authUser?: {
    uid: string;
    email?: string;
    emailVerified: boolean;
    name?: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  if (!token) {
    res.status(401).json({
      ok: false,
      error: 'Authentication required. Please sign in with Google first.',
    });
    return;
  }

  try {
    const decoded = await verifyFirebaseIdToken(token);
    if (!decoded?.uid) {
      res.status(401).json({ ok: false, error: 'Invalid authentication token.' });
      return;
    }
    req.authUser = {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: Boolean(decoded.email_verified),
      name: decoded.name,
    };
    next();
  } catch (err: any) {
    res.status(401).json({
      ok: false,
      error: 'Authentication session expired or invalid. Please sign in again.',
    });
  }
}
