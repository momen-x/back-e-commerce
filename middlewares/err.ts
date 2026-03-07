
import { NextFunction,Response,Request } from 'express';
import dotenv from 'dotenv';
 dotenv.config();
export const notFound= (req:Request,res:Response,next:NextFunction)=>{
    const err=new Error(`Not Found - ${req.originalUrl}`);
    res.status(404).json({
        message: err.message
    });
    next(err);
}

export const errorHandler=(err:Error,req:Request,res:Response,next:NextFunction)=>{
  const statusCode: number = res.statusCode === 200 ? 500 : res.statusCode;
   res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
}

module.exports={notFound,errorHandler};