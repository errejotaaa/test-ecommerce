import { config } from "dotenv";
import express from "express";
import { Application, Router, Request, Response } from "express";
import { connectDB } from "./db/connect";
import { notFound } from "./middleware/not-found";
import { errorHandlerMiddleware } from "./middleware/error-handler";
import "express-async-errors";

config();
export class App {
  private app!: Application;
  constructor(
    private port: string | number,
    private middleware: any[],
    private routes: Router[]
  ) {
    this.app = express();
    this.app.set("trust proxy", 1);
    this.setMiddleware();
    this.setRoutes();
    //this.setHome();
    this.setNotFoundMiddleware();
    this.setErrorHandlerMiddleware();
  }

  async listen() {
    try {
      await connectDB(process.env.MONGO_URI);
      this.app.listen(this.port, () =>
        console.log(`listening on port: ${this.port}`)
      );
    } catch (error) {
      console.log(error);
    }
  }

  setMiddleware() {
    this.middleware.forEach((m) => {
      this.app.use(m);
    });
  }

  // setHome() {
  //   this.app.get("/", (req: Request, res: Response) => {
  //     res.send(`<h1>E-commerce API</h1>`);
  //   });
  // }

  setRoutes() {
    this.routes.forEach((r, index) => {
      if (index === 0) {
        this.app.use("/api/v1/auth", r);
      }
      if (index === 1) {
        this.app.use("/api/v1/users", r);
      }
      if (index === 2) {
        this.app.use("/api/v1/products", r);
      }
      if (index === 3) {
        this.app.use("/api/v1/reviews", r);
      }
      if (index === 4) {
        this.app.use("/api/v1/orders", r);
      }
    });
  }

  setNotFoundMiddleware() {
    this.app.use(notFound);
  }
  setErrorHandlerMiddleware() {
    this.app.use(errorHandlerMiddleware);
  }
}
