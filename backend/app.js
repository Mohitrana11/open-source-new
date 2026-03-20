import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

// middlewares
import errorMiddleware from "./middlewares/error.js";
import userRoute from "./routers/userRoute.js";
import productRoute from "./routers/productRouter.js";
import orderRouter from "./routers/orderRouter.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/users", userRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", orderRouter);

app.use(errorMiddleware);

export default app;
