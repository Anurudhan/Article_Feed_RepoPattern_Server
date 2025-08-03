import mongoose, { Schema } from "mongoose";
import { ISignupInput } from "../types/userEntity"; 

const UserSchema = new Schema<ISignupInput>({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  phone:     { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  dob:       { type: String, required: true },
  password:  { type: String, required: true },
  articlePreferences: { type: [String], default: [] },
  isEmailVerified: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const UserModel = mongoose.model<ISignupInput>('User', UserSchema);

export default UserModel;