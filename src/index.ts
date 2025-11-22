import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import { connectDb } from "./lib/db";
import userRouter from "./routes/user.route";
import appRouter from "./routes/app.route";

configDotenv();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://192.168.29.178:5173"

app.use(express.json());
app.use(
  cors({
    origin: [FRONTEND_URL, "http://192.168.29.178:5173"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/app", appRouter);

const PORT = process.env.PORT || 3004;

(app as any).listen(PORT, "0.0.0.0", async () => {
  await connectDb();
});
