import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../lib/utils";

export const validateSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jwt_key } = req.cookies;

    if (!jwt_key) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    const decodedToken = decodeToken(jwt_key);

    if (!decodedToken || !decodedToken.id) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    req.userId = decodedToken.id;
    next();
  } catch (error) {
    console.log("SESSION_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};
