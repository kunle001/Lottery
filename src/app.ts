import express from "express";
import bodyParser from "body-parser";
import { errorController } from "./controllers/errorhandler.controller";

import AppError from "./utils/appError";
import cors from "cors";
import { currentUser } from "./middlewares/current_user";
import { authRouter } from "./routes/auth.route";
import { questionRouter } from "./routes/question.route";
import { gameRouter } from "./routes/game.route";
import { advertRouter } from "./routes/advert.route";
import { sendSuccess } from "./utils/response";
import dotenv from "dotenv";
import { UserRouter } from "./routes/user.route";
dotenv.config({ path: "./.env" });

const app = express();

app.use(bodyParser.json());
// app.use(mongoSanitize())

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(currentUser);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/question", questionRouter);
app.use("/api/v1/game", gameRouter);
app.use("/api/v1/advert", advertRouter);
app.use("/api/v1/user", UserRouter);

app.all("*", (req, res, next) => {
  throw new AppError("page not found", 404);
  return;
});

app.use(errorController);

// Export app
export { app };
