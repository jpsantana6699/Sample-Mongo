import BadRequestError from '../errors/BadRequestError';
import bcrypt from 'bcryptjs';

/**
 * Validates the strength of a password
 */
export const validatePasswordStrength = (password: string) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  if (!passwordRegex.test(password)) {
    // eslint-disable-next-line @stylistic/max-len
    throw new BadRequestError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number');
  }

  return true;
};

/**
 * Hashes a password
 */
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};