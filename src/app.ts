// app.ts
import express, { Application, NextFunction, Request, Response } from "express";
import { envVaribales } from "./config/env_Variables";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import router from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import { StatusCodes } from "./config/statusCode";
import { Messages } from "./config/Messages";
import { AppError } from "./utils/API_Error";

const app: Application = express();

app.use(
  cors({
    origin: [envVaribales.FRONTEND_URL],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./assets"));
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Routes
app.use("/", router);

app.get("/",(req:Request,res:Response)=>{
  res.send('✅ Knowaria backend is up and running!');
})
// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});


app.use(
  (err: AppError, req: Request, res: Response, next: NextFunction) => {
    console.error("💥 Error:", err.message);

    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || Messages.INTERNAL.SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
);


export default app;
