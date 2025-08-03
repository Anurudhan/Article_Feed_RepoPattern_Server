// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/auth.repository';
import { createAccessToken, createRefreshToken } from '../utils/middleware/token';
import { AppError } from '../utils/API_Error';
import { Messages } from '../config/Messages';
import { StatusCodes } from '../config/statusCode';
import { IUser } from '../types/userEntity';
import { validateEmail, validatePhone } from '../utils/validator';
import { ArticleCategory } from '../types/articleEntity';
import { Mongoose, Types } from 'mongoose';


export class AuthService {
  constructor(private authRepo = new AuthRepository()) {}

  async signup(userData: any) {
    const { email, password, confirmPassword } = userData;

    if (!password || !confirmPassword) {
      throw new AppError(Messages.AUTH.PASSWORD_REQUIRED, StatusCodes.BAD_REQUEST);
    }

    if (password !== confirmPassword) {
      throw new AppError(Messages.AUTH.PASSWORD_MISMATCH, StatusCodes.BAD_REQUEST);
    }

    const existing = await this.authRepo.findUserByEmail(email);
    if (existing) throw new AppError(Messages.AUTH.EMAIL_ALREADY_EXISTS, StatusCodes.CONFLICT);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      ...userData,
      password: hashedPassword,
      isEmailVerified: false,
      otp: [],
    };

    await this.authRepo.createUser(newUser);
    return { message: 'User created successfully' };
  }

  async login(emailOrPhone: string, password: string) {
    const user = await this.authRepo.findUserByEmailOrPhone(emailOrPhone);
    if (!user) throw new AppError(Messages.AUTH.INVALID_CREDENTIALS, StatusCodes.UNAUTHORIZED);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError(Messages.AUTH.INVALID_CREDENTIALS, StatusCodes.UNAUTHORIZED);

    const payload = { userId: user._id };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    return { accessToken, refreshToken, user };
  }

  async getUser(userId: string) {
    const user = await this.authRepo.findUserById(userId);
    if (!user) throw new AppError(Messages.AUTH.USER_NOT_FOUND, StatusCodes.NOT_FOUND);
    return user;
  }
  async updateProfile(userId: string, data: Partial<IUser>) {
    const { firstName, lastName, email, phone, dob } = data;

    const updateFields: Partial<IUser> = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) {
      if (!validateEmail(email)) throw new AppError('Invalid email format', StatusCodes.BAD_REQUEST);
      updateFields.email = email;
    }
    if (phone) {
      if (!validatePhone(phone)) throw new AppError('Invalid phone number format', StatusCodes.BAD_REQUEST);
      updateFields.phone = phone;
    }
    if (dob) {
      if (isNaN(Date.parse(dob))) throw new AppError('Invalid date of birth format', StatusCodes.BAD_REQUEST);
      updateFields.dob = dob;
    }

    if (Object.keys(updateFields).length === 0) {
      throw new AppError('At least one field must be provided', StatusCodes.BAD_REQUEST);
    }

    const updatedUser = await this.authRepo.updateUserProfile(userId, updateFields);
    return { user: updatedUser };
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new passwords are required', StatusCodes.BAD_REQUEST);
    }

    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters', StatusCodes.BAD_REQUEST);
    }
    console.log("this is userId",userId)
    const user = await this.authRepo.findUserById(userId,true);
    console.log(user,"this is the password")
     if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    console.log(isPasswordValid,"valid===>")
    if (!isPasswordValid) throw new AppError('Current password is incorrect', StatusCodes.UNAUTHORIZED);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(hashedPassword,"this is hashPassword")
    await this.authRepo.updateUserPassword(userId, hashedPassword);
    return { message: 'Password updated successfully' };
  }

  async updatePreferences(userId: string, preferences: string[]) {
    if (!Array.isArray(preferences) || preferences.length === 0) {
      throw new AppError('At least one preference is required', StatusCodes.BAD_REQUEST);
    }

    if (preferences.length > 3) {
      throw new AppError('You can select up to 3 preferences only', StatusCodes.BAD_REQUEST);
    }

    const validCategories = ArticleCategory.map((cat) => cat.id);
    const invalidPreferences = preferences.filter((pref) => !validCategories.includes(pref));
    if (invalidPreferences.length > 0) {
      throw new AppError('Invalid article preferences provided', StatusCodes.BAD_REQUEST);
    }

    const updatedUser = await this.authRepo.updateUserPreferences(userId, preferences);
    return { preferences: updatedUser.articlePreferences };
  }
}
