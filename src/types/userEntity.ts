import { Types } from "mongoose";

// Interface representing the user data returned from the server (e.g., after login or get user)
export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string;
  articlePreferences: string[];
  isEmailVerified: boolean;
}

// Signup input — what the user sends when creating a new account
export interface ISignupInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string;
  password: string;
  confirmPassword: string;
  articlePreferences: string[];
  isEmailVerified:boolean;
}

// Login input — what the user sends to log in
export interface ILoginInput {
  email?: string;
  phone?:string;
  password: string;
}
