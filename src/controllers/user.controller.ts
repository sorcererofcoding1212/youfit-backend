import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../lib/schema";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { clearCookie, generateToken, setAuthCookie } from "../lib/utils";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, fullName, password } = req.body;
    
    const { success, error } = registerSchema.safeParse({
      phoneNumber,
      fullName,
      password,
    });

    if (!success) {
      res.json({
        msg: error.message || "Invalid inputs",
        success: false,
      });
      return;
    }

    const existingUser = await User.findOne({
      phoneNumber,
    });

    if (existingUser) {
      res.json({
        msg: "Phone number already registered",
        success: false,
      });
      return;
    }
    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      phoneNumber,
      password: encryptedPassword,
      fullName,
    });

    const token = generateToken(user.phoneNumber, user.id);

    setAuthCookie(res, token).json({
      msg: "User registered",
      success: true,
      details: {
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        id: user.id,
      },
    });
  } catch (error) {
    console.log(error, "REGISTER_ERROR");
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;

    const { success, error } = loginSchema.safeParse({
      phoneNumber,
      password,
    });

    if (!success) {
      res.json({
        msg: error.message || "Invalid inputs",
        success: false,
      });
      return;
    }

    const user = await User.findOne({
      phoneNumber,
    });

    if (!user) {
      res.json({
        msg: "Invalid credentials",
        success: false,
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.json({
        msg: "Invalid credentials",
        success: false,
      });
      return;
    }

    const token = generateToken(user.phoneNumber, user.id);

    setAuthCookie(res, token).json({
      msg: "Logged in",
      success: true,
      details: {
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        id: user.id,
      },
    });
  } catch (error) {
    console.log(error, "LOGIN_ERROR");
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    clearCookie(res, "jwt_key").json({
      msg: "Logged out",
      success: true,
    });
  } catch (error) {
    console.log(error, "LOGOUT_ERROR");
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.json({
        msg: "User not found",
        success: false,
      });
      return;
    }

    res.json({
      msg: "Session validated",
      success: true,
      details: {
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        id: user._id,
      },
    });
  } catch (error) {
    console.log(error, "SESSION_ERROR");
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};
