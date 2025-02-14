import { NextFunction, Request, Response } from "express";
import { Schema, func } from "joi";
import AppError from "./appError";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import dotenv from "dotenv";
import Joi from "joi";

dotenv.config({ path: "./.env" });

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }
    next();
  };
};

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  image?: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

const secretKey = process.env.JWT_KEY!;
const expiresIn = process.env.EXPIRES_IN!;

// Function to sign and send JWT token
export function signToken(payload: UserPayload): string {
  try {
    const token = jwt.sign(payload, secretKey, { expiresIn });
    return token;
  } catch (err: any) {
    throw new AppError(err.message, 500);
  }
}

// Function to verify JWT token
export function verifyToken(token: string): string {
  try {
    const decoded = jwt.verify(token, secretKey) as any;
    return decoded;
  } catch (err: any) {
    console.error("Error verifying JWT token:", err);
    throw new AppError(err.message, 500);
  }
}

export class ValidationSchema {
  private mediumTextRq(required?: boolean): Joi.Schema {
    return required
      ? Joi.string().min(5).max(30).required()
      : Joi.string().min(5).max(30);
  }

  private largeTextRq(required?: boolean): Joi.Schema {
    return required
      ? Joi.string().min(10).max(100).required()
      : Joi.string().min(10).max(100);
  }

  public login(): Joi.ObjectSchema<any> {
    return Joi.object({
      email: this.mediumTextRq(true),
      password: this.mediumTextRq(true),
    });
  }

  public getRecordByDate(): Joi.ObjectSchema<any> {
    return Joi.object({
      start_date: Joi.number().required(),
      to_date: Joi.number().required(),
      no_records: Joi.number().required(),
    });
  }
}
