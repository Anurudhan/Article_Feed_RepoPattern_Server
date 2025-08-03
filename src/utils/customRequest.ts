// types/CustomRequest.ts
import { Request } from "express";

export interface CustomRequest extends Request {
  user?: {
    userId: string;
    // add any other properties you attach to the token (e.g., email, role, etc.)
  };
}
