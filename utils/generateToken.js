import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'studenthub_jwt_super_secret_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};
