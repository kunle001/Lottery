import { NextFunction, Request, Response } from "express"
import { Schema } from "joi"
import AppError from "./appError"
import jwt, {JwtPayload} from "jsonwebtoken"


export const  validateRequest= (schema: Schema)=>{
    return (req:Request, res:Response, next:NextFunction)=>{
        const {error}= schema.validate(req.body)
        if (error){
            throw new AppError(error.details[0].message, 400)
        }
        next()
    }
}

export interface UserPayload {
    id: string;
    email: string;
    role?: string;
    image?: string;
    points?: number;
    account_balance?: number;
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}
