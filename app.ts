import { middleware } from "./middleware/middleware";
import { App } from "./app.configuration";
import { authRouter } from "./routes/auth";
import { userRouter } from "./routes/user";
import { productRouter } from "./routes/product";
import reviewRouter from "./routes/review";
import orderRouter from "./routes/order";

const port = process.env.PORT || 8000;

const app = new App(port, middleware, [
  authRouter,
  userRouter,
  productRouter,
  reviewRouter,
  orderRouter,
]);

app.listen();
