import UserModel from "../models/userModal";
import { IUser } from "../types/userEntity";
import { AppError } from "../utils/API_Error";


export class AuthRepository {
  async findUserByEmailOrPhone(emailOrPhone: string) {
    try {
      return await UserModel.findOne({
        $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      });
    } catch (error) {
      throw new AppError('Database error: Failed to find user by email or phone', 500);
    }
  }

  async findUserByEmail(email: string) {
    try {
      return await UserModel.findOne({ email });
    } catch (error) {
      throw new AppError('Database error: Failed to find user by email', 500);
    }
  }

  async createUser(userData: Partial<IUser>) {
    try {
      const user = new UserModel(userData);
      return await user.save();
    } catch (error) {
      throw new AppError('Database error: Failed to create user', 500);
    }
  }

  async findUserById(userId: string,isPassword?:boolean) {
    try {
        if(isPassword) return await UserModel.findById(userId).select('-otp');
        return await UserModel.findById(userId).select('-password -otp');
    } catch (error) {
      throw new AppError('Database error: Failed to find user by ID', 500);
    }
  }
  async updateUserProfile(userId: string, updateData: Partial<IUser>) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password -otp');
      if (!user) throw new AppError('User not found', 404);
      return user;
    } catch (error) {
      throw new AppError('Database error: Failed to update user profile', 500);
    }
  }
   async updateUserPassword(userId: string, newPassword: string) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) throw new AppError('User not found', 404);
      user.password = newPassword;
      await user.save();
      return user;
    } catch (error) {
      throw new AppError('Database error: Failed to update user password', 500);
    }
  }
  async updateUserPreferences(userId: string, preferences: string[]) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { articlePreferences: preferences },
        { new: true, runValidators: true }
      ).select('-password -otp');
      if (!user) throw new AppError('User not found', 404);
      return user;
    } catch (error) {
      throw new AppError('Database error: Failed to update user preferences', 500);
    }
  }
}
