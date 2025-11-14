import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { getUserDetails } from '../services/authService'; // Import a service to fetch user details

// Middleware to attach user details to the request object
export const attachUserMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userDetails = await getUserDetails(req.headers.authorization); // Fetch user details dynamically

    if (!userDetails) {
      return res.status(401).json({ message: 'Unauthorized: User details not found' });
    }

    req.user = {
      alias: userDetails.alias,
      idNegocio: userDetails.idNegocio,
    };

    console.log('👤 [Middleware] User attached to request:', req.user);
    next();
  } catch (error) {
    console.error('❌ [Middleware] Error attaching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};