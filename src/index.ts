import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import { connectDb } from "./lib/db";
import userRouter from "./routes/user.route";
import appRouter from "./routes/app.route";

configDotenv();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "*";

app.use(express.json());
app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/app", appRouter);

const PORT = process.env.PORT || 3004;

app.listen(PORT, async () => {
  await connectDb();
});
