import { NextFunction,Response,Request } from 'express';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export const VeriFyToken=(req:Request,res:Response,next:NextFunction)=>{
    const authToken = req.cookies.token;
    if(!authToken){
        res.status(401).json({message:"you are not authenticated"});
        return;
    }
    try {
      // console.log("cookies: ", req.cookies);
        // const token = authToken?.split(" ")[1];
        const decoded = jwt.verify(authToken as string, process.env.JWT_SECRET_KEY as string);
        (req as any).user = decoded;
        next();
    } catch (err) {
        res.status(403).json({message:"token is not valid"});
    }
}




export const verifyTokenAndAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  VeriFyToken(req, res, () => {
    if (
      (req as any).user.id === req.params.id ||
      (req as any).user.isAdmin
    ) {
      next();
    } else {
      res.status(403).json({
        message: "You are not allowed to do that",
      });
    }
  });
};


export const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  VeriFyToken(req, res, () => {
    if ((req as any).user.isAdmin) {
      next();
    } else {
      res.status(403).json({
        message: "You are not allowed to do that",
      });
    }
  });
};