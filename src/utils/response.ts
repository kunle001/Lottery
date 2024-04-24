import { Response } from "express"

export const sendSuccess= (res:Response, code:number,message:any,msg?:string)=>{
    return res.status(code).json({
        success:true,
        message: msg||"done",
        status: "success",
        data: message,
    })
}