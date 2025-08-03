import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomRequest } from '../customRequest';
import { AuthRepository } from '../../repositories/auth.repository';
import { createAccessToken } from './token';
import { AppError } from '../API_Error';
import { StatusCodes } from '../../config/statusCode';
import { Messages } from '../../config/Messages';

interface TokenPayload {
  userId: string;
}

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const authenticateUser = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  const authRepository = new AuthRepository();

  try {
    if (accessToken) {
      const decoded = jwt.verify(accessToken, ACCESS_SECRET) as TokenPayload;
      if (!decoded.userId) throw new AppError(Messages.AUTH.ACCESS_TOKEN_INVALID, StatusCodes.UNAUTHORIZED);

      const user = await authRepository.findUserById(decoded.userId);
      if (!user) throw new AppError(Messages.AUTH.USER_NOT_FOUND, StatusCodes.NOT_FOUND);

      req.user = decoded;
      return next();
    }

    if (!refreshToken) {
      throw new AppError(Messages.AUTH.TOKENS_MISSING, StatusCodes.UNAUTHORIZED);
    }

    const decodedRefresh = jwt.verify(refreshToken, REFRESH_SECRET) as TokenPayload;
    if (!decodedRefresh.userId) throw new AppError(Messages.AUTH.REFRESH_TOKEN_INVALID, StatusCodes.UNAUTHORIZED);

    const user = await authRepository.findUserById(decodedRefresh.userId);
    if (!user) throw new AppError(Messages.AUTH.USER_NOT_FOUND, StatusCodes.NOT_FOUND);


    const newAccessToken = createAccessToken({ userId: decodedRefresh.userId });
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    req.user = decodedRefresh;
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('Authentication failed', StatusCodes.UNAUTHORIZED));
  }
};
