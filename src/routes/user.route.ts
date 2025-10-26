import { Router } from "express";
import {
  getSession,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller";
import { validateSession } from "../middlewares/user.middleware";

const route = Router();

route.post("/register", registerUser);
route.post("/login", loginUser);
route.post("/logout", validateSession, logoutUser);
route.get("/check", validateSession, getSession);

export default route;
