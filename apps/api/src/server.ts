import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import indexRouter from "./routes/index";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors(
      { origin: "http://localhost:5173" }
    ))

    app.use("/api/v1", indexRouter);


  return app;
};
