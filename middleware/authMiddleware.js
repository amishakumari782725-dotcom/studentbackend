import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'studenthub_jwt_super_secret_key_2026'
      );

      req.user = await Admin.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, administrator account not found',
        });
      }

      next();
    } catch (error) {
      console.error('[AuthMiddleware] Error verifying token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired session token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no authentication token provided',
    });
  }
};
