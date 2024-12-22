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
import { TransactionRouter } from "./routes/transaction";
import { ViewRouter } from "./routes/view.route";
import { NotificationRouter } from "./routes/notification.route";
import { APP_VERSION } from "./config";
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

app.use("/api/v1/auth", authRouter);

app.use(currentUser);
app.use("/api/v1/question", questionRouter);
app.use("/api/v1/game", gameRouter);
app.use("/api/v1/advert", advertRouter);
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/transaction", TransactionRouter);
app.use("/api/v1/views", ViewRouter);
app.use("/api/v1/notification", NotificationRouter);

app.get("/app-version", (req, res) => {
  sendSuccess(res, 200, APP_VERSION, APP_VERSION);
});

app.all("*", (req, res, next) => {
  throw new AppError("page not found", 404);
});

app.use(errorController);

// Export app
export { app };
