import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { CustomRequest } from '../utils/customRequest';
import { StatusCodes } from '../config/statusCode';
import { Messages } from '../config/Messages';

export class AuthController {
  constructor(private authService = new AuthService()) {}

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.authService.signup(req.body);
      res.status(StatusCodes.CREATED).json({
        ...response,
        message: Messages.AUTH.SIGNUP_SUCCESS,
      });
    } catch (err) {
      next(err); 
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { emailOrPhone, password } = req.body;
      const { accessToken, refreshToken, user } = await this.authService.login(emailOrPhone, password);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCodes.OK).json({
        message: Messages.AUTH.LOGIN_SUCCESS,
        success: true,
        user,
      });
    } catch (err) {
      next(err); 
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(StatusCodes.OK).json({ message: Messages.AUTH.LOGOUT_SUCCESS });
  }

  async getUser(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: Messages.AUTH.UNAUTHORIZED });
      }

      const user = await this.authService.getUser(userId);
      res.status(StatusCodes.OK).json({
        data: user,
        success: true,
        message: Messages.AUTH.USER_FETCH_SUCCESS,
      });
    } catch (err) {
      next(err); 
    }
  }
    async updateProfile(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: Messages.AUTH.UNAUTHORIZED });
      }

      const response = await this.authService.updateProfile(userId, req.body);
      res.status(StatusCodes.OK).json({
        data: response,
        message: Messages.USER.PROFILE_UPDATED,
        success: true,
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePassword(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: Messages.AUTH.UNAUTHORIZED });
      }

      const { currentPassword, newPassword } = req.body;
      const response = await this.authService.updatePassword(userId, currentPassword, newPassword);
      res.status(StatusCodes.OK).json({
        message: Messages.USER.PASSWORD_UPDATED,
        success: true,
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: Messages.AUTH.UNAUTHORIZED });
      }

      const { preferences } = req.body;
      const response = await this.authService.updatePreferences(userId, preferences);
      res.status(StatusCodes.OK).json({
        data: response,
        message: Messages.USER.PREFERENCES_UPDATED,
        success: true,
      });
    } catch (err) {
      next(err);
    }
  }
}
