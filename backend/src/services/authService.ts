import jwt from 'jsonwebtoken';

interface UserDetails {
  alias: string;
  idNegocio: number;
}

export const getUserDetails = (authorizationHeader?: string): UserDetails | null => {
  if (!authorizationHeader) {
    console.error('❌ [AuthService] Missing Authorization header');
    return null;
  }

  const token = authorizationHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) {
    console.error('❌ [AuthService] Missing token in Authorization header');
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as UserDetails;
    return decoded;
  } catch (error) {
    console.error('❌ [AuthService] Invalid token:', error);
    return null;
  }
};